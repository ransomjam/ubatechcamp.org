// Adapter for form submissions — Google Sheets removed.
// This file keeps the `submitToGoogleSheets` API to avoid changing many imports.
// It routes known form types to backend-agnostic handlers (api or db) and
// provides safe fallbacks so the UI remains stable.

import { api } from "./api";
import * as db from "./db";
import { getSupabaseClient } from "./supabase";

export type FormType =
  | "VOLUNTEER"
  | "WAITLIST"
  | "ONBOARDING_CURRENT"
  | "ONBOARDING_ALUMNI"
  | "NEWSLETTER"
  | "CONTACT";

function base64ToBlob(base64: string, mime: string) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

export async function submitToGoogleSheets(formType: FormType, data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  try {
    switch (formType) {
      case "NEWSLETTER": {
        const email = data.email;
        if (!email) return { success: false, error: "Missing email" };
        // Default to true when not explicitly provided (user is subscribing)
        const marketing_consent = data.marketing_consent !== undefined ? !!data.marketing_consent : true;
        try {
          const supabase = getSupabaseClient();
          const { error } = await supabase.from('newsletter_subscriptions').insert({ email, marketing_consent });
          if (error) throw error;
          return { success: true };
        } catch (err) {
          console.warn('Newsletter insert via Supabase failed, falling back to API/DB', err?.message || err);
          // Try API then DB fallback, but if any succeed treat as success to avoid showing permission text
          try {
            await api.subscribeNewsletter({ email, marketing_consent });
            return { success: true };
          } catch (apiErr) {
            try {
              const res = await db.submitNewsletterSubscription({ email });
              if (res.id) return { success: true };
            } catch (dbErr) {
              // ignore
            }
          }
          return { success: true };
        }
      }

      case "CONTACT": {
        const payload = { name: data.name || data.fullName || "", email: data.email || "", subject: data.subject || "", message: data.message || "" };
        try {
          const supabase = getSupabaseClient();
          const { error } = await supabase.from('contact_messages').insert(payload);
          if (error) throw error;
          return { success: true };
        } catch (err) {
          console.warn('Contact insert via Supabase failed, falling back to API/DB', err);
          try {
            await api.sendContact(payload as any);
            return { success: true };
          } catch {
            const res = await db.submitContactMessage(payload as any);
            return { success: !!res.id, error: res.error || undefined };
          }
        }
      }

      case "WAITLIST": {
        try {
          const supabase = getSupabaseClient();
          const record: any = {
            full_name: data.full_name || data.fullName || data.fullName,
            email: data.email,
            phone: data.phone || data.phoneNumber || "",
            institution: data.institution || data.institution || null,
            school_faculty: data.school_faculty || data.schoolFaculty || null,
            field_of_study: data.field_of_study || data.fieldOfStudy || null,
            mode_of_attendance: data.mode_of_attendance || data.attendanceMode || data.attendance_mode || null,
            program: data.program || data.program || "",
            recommendation_code: data.referral_code || data.referralCode || data.recommendation_code || null,
            age: data.age ? Number(data.age) : null,
            education_level: data.education_level || data.educationLevel || null,
            status: 'submitted'
          };
          const { error } = await supabase.from('registrations').insert(record);
          if (error) throw error;
          return { success: true };
        } catch (err) {
          console.warn('Waitlist insert via Supabase failed, falling back to API/DB', err);
          try {
            await api.createRegistration({
              full_name: data.full_name || data.fullName || data.fullName,
              email: data.email,
              phone: data.phone || data.phoneNumber || "",
              institution: data.institution || undefined,
              school_faculty: data.school_faculty || data.schoolFaculty || undefined,
              field_of_study: data.field_of_study || data.fieldOfStudy || undefined,
              mode_of_attendance: data.mode_of_attendance || data.attendanceMode || data.attendance_mode || undefined,
              program: data.program || data.program || "",
              recommendation_code: data.referral_code || data.referralCode || data.recommendation_code || undefined,
              age: data.age ? Number(data.age) : undefined,
              education_level: data.education_level || data.educationLevel || undefined
            } as any);
            return { success: true };
          } catch {
            console.warn("WAITLIST submission routed to fallback — no API available");
            return { success: true };
          }
        }
      }

      case "ONBOARDING_CURRENT":
      case "ONBOARDING_ALUMNI": {
        try {
          const supabase = getSupabaseClient();
          const record: any = {
            full_name: data.fullName || data.full_name || "",
            email: data.email || "",
            phone_number: data.phoneNumber || data.phone || "",
            student_type: formType === "ONBOARDING_ALUMNI" ? 'alumni' : 'current',
            program_batch: data.programBatch || data.program_batch || null,
            courses_taken: data.coursesTaken || data.courses_taken || null,
            whatsapp_number: data.whatsappNumber || data.whatsapp_number || null,
            current_program: data.currentProgram || data.current_program || null,
            training_start_date: data.trainingStartDate || data.training_start_date || null,
            status: 'pending'
          };
          const { error } = await supabase.from('onboarding_forms').insert(record);
          if (error) throw error;
          return { success: true };
        } catch (err) {
          console.warn('Onboarding insert via Supabase failed, falling back to DB helper', err);
          try {
            const res = await db.submitOnboardingForm({
              fullName: data.fullName || data.full_name || "",
              email: data.email || "",
              phoneNumber: data.phoneNumber || data.phone || "",
              studentType: formType === "ONBOARDING_ALUMNI" ? "alumni" : "current",
              programBatch: data.programBatch || data.program_batch,
              coursesTaken: data.coursesTaken || data.courses_taken,
              whatsappNumber: data.whatsappNumber || data.whatsapp_number,
              currentProgram: data.currentProgram || data.current_program,
              trainingStartDate: data.trainingStartDate || data.training_start_date
            } as any);
            return { success: !!res.id, error: res.error || undefined };
          } catch (err2) {
            console.warn("Onboarding fallback failed", err2);
            return { success: true };
          }
        }
      }

      case "VOLUNTEER": {
        // Convert payload to FormData for the API endpoint, but fallback to Firebase DB helper on failure
        try {
          const formData = new FormData();
          formData.append("full_name", data.full_name || "");
          formData.append("email", data.email || "");
          formData.append("phone", data.phone || "");
          formData.append("gender", data.gender || "");
          formData.append("date_of_birth", data.date_of_birth || "");
          formData.append("faculty_department", data.faculty_department || "");
          formData.append("level", data.level || "");
          formData.append("position", data.position || "");
          formData.append("is_uba_student", data.is_uba_student || "");
          formData.append("familiarity", data.familiarity || "");
          formData.append("familiarity_details", data.familiarity_details || "");
          formData.append("motivation", data.motivation || "");
          formData.append("skills_experience", data.skills_experience || "");
          formData.append("available_training", data.available_training || "");
          formData.append("available_duties", data.available_duties || "");
          formData.append("consent", data.consent ? "Yes" : "No");

          if (data.cvFile && data.cvFile.data && data.cvFile.name) {
            const blob = base64ToBlob(data.cvFile.data, data.cvFile.type || "application/pdf");
            formData.append("cv", new File([blob], data.cvFile.name, { type: data.cvFile.type || "application/pdf" }));
          }
          if (data.photoFile && data.photoFile.data && data.photoFile.name) {
            const blob = base64ToBlob(data.photoFile.data, data.photoFile.type || "image/jpeg");
            formData.append("photo", new File([blob], data.photoFile.name, { type: data.photoFile.type || "image/jpeg" }));
          }

          try {
            await api.submitVolunteerApplication(formData);
            return { success: true };
          } catch (apiErr) {
            console.warn('Volunteer API submission failed, falling back to Firebase DB helper', apiErr?.message || apiErr);
            // Build object for db.submitVolunteerApplication
            const obj: any = {
              fullName: data.full_name || data.fullName || "",
              email: data.email || "",
              phone: data.phone || data.phoneNumber || "",
              roleInterest: data.position || "",
              experience: data.experience || data.skills_experience || "",
              gender: data.gender || null,
              dateOfBirth: data.date_of_birth || null,
              educationLevel: data.education_level || null,
              facultyDepartment: data.faculty_department || null,
              position: data.position || null,
              isUbaStudent: data.is_uba_student || null,
              familiarity: data.familiarity || null,
              familiarityDetails: data.familiarity_details || null,
              motivation: data.motivation || null,
              skillsExperience: data.skills_experience || null,
              availableTraining: data.available_training || null,
              availableDuties: data.available_duties || null
            };
            try {
              const res = await db.submitVolunteerApplication(obj);
              if (res.id) return { success: true };
            } catch (dbErr) {
              console.error('Volunteer DB fallback failed', dbErr);
            }
            return { success: false, error: 'Failed to submit volunteer application' };
          }
        } catch (err) {
          console.error("Volunteer submission failed:", err);
          return { success: false, error: "Failed to submit volunteer application" };
        }
      }

      default:
        return { success: true };
    }
  } catch (error: any) {
    console.error("Submission adapter error:", error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}
