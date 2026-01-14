import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Registration Applications
export const submitRegistrationApplication = async (data: {
  fullName: string;
  email: string;
  phone: string;
  program: string;
  motivation?: string;
  age?: string;
  educationLevel?: string;
  attendanceMode?: string;
  institution?: string;
  faculty?: string;
  hearAboutUs?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "registration_applications"), {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      program: data.program,
      motivation: data.motivation || "",
      age: data.age || "",
      educationLevel: data.educationLevel || "",
      attendanceMode: data.attendanceMode || "",
      institution: data.institution || "",
      faculty: data.faculty || "",
      hearAboutUs: data.hearAboutUs || "",
      createdAt: serverTimestamp(),
      status: "submitted"
    });
    console.log("✅ Registration submitted:", docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error("❌ Registration error:", error.message);
    return { id: null, error: error.message };
  }
};

// Onboarding Forms
export const submitOnboardingForm = async (data: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  studentId?: string;
  institution?: string;
  schoolFaculty?: string;
  fieldOfStudy?: string;
  department?: string;
  deviceAvailable?: string;
  studentType: "alumni" | "current";
  programBatch?: string;
  coursesTaken?: string;
  whatsappNumber?: string;
  currentProgram?: string;
  trainingStartDate?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "onboarding_forms"), {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber || "",
      studentId: data.studentId || "",
      institution: data.institution || "",
      schoolFaculty: data.schoolFaculty || "",
      fieldOfStudy: data.fieldOfStudy || "",
      department: data.department || "",
      deviceAvailable: data.deviceAvailable || "",
      studentType: data.studentType,
      programBatch: data.programBatch || "",
      coursesTaken: data.coursesTaken || "",
      whatsappNumber: data.whatsappNumber || "",
      currentProgram: data.currentProgram || "",
      trainingStartDate: data.trainingStartDate || "",
      createdAt: serverTimestamp(),
      status: "pending"
    });
    console.log("✅ Onboarding form submitted:", docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error("❌ Onboarding error:", error.message);
    return { id: null, error: error.message };
  }
};

// Volunteer Applications
export const submitVolunteerApplication = async (data: {
  fullName: string;
  email: string;
  phone: string;
  roleInterest: string;
  experience: string;
  gender?: string;
  dateOfBirth?: string;
  educationLevel?: string;
  facultyDepartment?: string;
  position?: string;
  isUbaStudent?: string;
  familiarity?: string;
  familiarityDetails?: string;
  motivation?: string;
  skillsExperience?: string;
  availableTraining?: string;
  availableDuties?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "volunteer_applications"), {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      roleInterest: data.roleInterest,
      experience: data.experience,
      gender: data.gender || "",
      dateOfBirth: data.dateOfBirth || "",
      educationLevel: data.educationLevel || "",
      facultyDepartment: data.facultyDepartment || "",
      position: data.position || "",
      isUbaStudent: data.isUbaStudent || "",
      familiarity: data.familiarity || "",
      familiarityDetails: data.familiarityDetails || "",
      motivation: data.motivation || "",
      skillsExperience: data.skillsExperience || "",
      availableTraining: data.availableTraining || "",
      availableDuties: data.availableDuties || "",
      createdAt: serverTimestamp(),
      status: "pending"
    });
    console.log("✅ Volunteer application submitted:", docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error("❌ Volunteer application error:", error.message);
    return { id: null, error: error.message };
  }
};

// Contact Messages
export const submitContactMessage = async (data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "contact_messages"), {
      name: data.name,
      email: data.email,
      subject: data.subject || "",
      message: data.message,
      createdAt: serverTimestamp()
    });
    console.log("✅ Contact message submitted:", docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error("❌ Contact message error:", error.message);
    return { id: null, error: error.message };
  }
};

// Newsletter Subscriptions
export const submitNewsletterSubscription = async (data: {
  email: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "newsletter_subscriptions"), {
      email: data.email,
      createdAt: serverTimestamp()
    });
    console.log("✅ Newsletter subscription added:", docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error("❌ Newsletter subscription error:", error.message);
    return { id: null, error: error.message };
  }
};

// Donations
export const submitDonation = async (data: {
  fullName: string;
  email: string;
  donorType: "individual" | "organisation";
  organisationName?: string;
  amount: string;
  reason: string;
  otherReason?: string;
  paymentMethod: string;
  phoneNumber: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "donations"), {
      fullName: data.fullName,
      email: data.email,
      donorType: data.donorType,
      organisationName: data.organisationName || "",
      amount: data.amount,
      reason: data.reason,
      otherReason: data.otherReason || "",
      paymentMethod: data.paymentMethod,
      phoneNumber: data.phoneNumber,
      createdAt: serverTimestamp(),
      status: "pending"
    });
    console.log("✅ Donation submitted:", docRef.id);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    console.error("❌ Donation error:", error.message);
    return { id: null, error: error.message };
  }
};
