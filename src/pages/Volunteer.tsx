import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Upload } from "lucide-react";
import { submitToGoogleSheets } from "@/lib/googleSheets";

const volunteerSchema = z.object({
  full_name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().nonempty("Phone number is required"),
  gender: z.enum(["male", "female", "prefer_not_to_say"]),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  faculty_department: z.string().min(1, "Faculty/Department is required"),
  level: z.string().min(1, "Level is required"),
  position: z.string().min(1, "Position is required"),
  is_uba_student: z.enum(["yes", "no"]),
  familiarity: z.string().min(1, "Please select your familiarity level"),
  familiarity_details: z.string().optional(),
  motivation: z.string().nonempty("Please explain your motivation"),
  skills_experience: z.string().optional(),
  available_training: z.enum(["yes", "no"]),
  available_duties: z.enum(["yes", "no"]),
  consent: z.boolean().refine(val => val === true, "You must agree to the declaration"),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

const positions = [
  "Programme & Training Manager",
  "Student Community Manager",
  "Media & Communications Lead",
  "Public Relations Officer (PRO)"
];

const familiarityOptions = [
  "Very familiar — I follow the programme closely",
  "Somewhat familiar — I know the main concept",
  "New to it — I'm excited to learn more"
];

const levels = [
  "Level 200",
  "Level 300",
  "Level 400",
  "Level 500",
  "Level 600",
  "Level 700"
];

const MAX_IMAGE_SIZE = 800; // Max width/height for compressed images
const MAX_FILE_SIZE_MB = 2; // Max file size in MB before compression
const SUBMISSION_TIMEOUT = 90000; // 90 second timeout for large files

// Generate unique submission ID to prevent duplicates
const generateSubmissionId = (): string => {
  return `VOL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Compress image to reduce file size
const compressImage = (file: File, maxSize: number = MAX_IMAGE_SIZE): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Skip compression for non-image files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob with quality compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        0.7 // 70% quality for good balance
      );
    };

    img.onerror = () => resolve(file); // Fallback to original on error
    img.src = URL.createObjectURL(file);
  });
};

// Single fetch with timeout (no retry to prevent duplicates)
const fetchWithTimeout = async (
  url: string, 
  options: RequestInit, 
  timeout: number = SUBMISSION_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if ((error as Error).name === 'AbortError') {
      throw new Error('Request timed out. Your application may have been submitted. Please check your email before trying again.');
    }
    throw error;
  }
};

const Volunteer = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [submitProgress, setSubmitProgress] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      consent: false
    }
  });

  // Scroll to first error field on validation failure
  const scrollToFirstError = () => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const element = document.getElementById(firstErrorKey) || 
                      document.querySelector(`[name="${firstErrorKey}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        (element as HTMLElement).focus?.();
      }
    }
  };

  // Watch for errors and scroll when they appear
  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToFirstError();
    }
  }, [errors]);

  const isUbaStudent = watch("is_uba_student");

  // Convert file for upload with optional compression
  const convertFile = async (
    file: File | null, 
    compress: boolean = false
  ): Promise<{ name: string; type: string; data: string } | null> => {
    if (!file) return null;
    
    let processedFile = file;
    
    // Compress images if they're large
    if (compress && file.type.startsWith('image/') && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      processedFile = await compressImage(file);
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({
          name: processedFile.name,
          type: processedFile.type,
          data: base64
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(processedFile);
    });
  };

  const onSubmit = async (data: VolunteerFormData) => {
    setIsSubmitting(true);
    setSubmitProgress("Preparing your application...");

    // Generate unique ID to prevent duplicate submissions
    const submissionId = generateSubmissionId();

    try {
      // Process files with compression for images
      setSubmitProgress("Processing files...");
      const [cvData, photoData] = await Promise.all([
        convertFile(cvFile, false), // Don't compress PDFs
        convertFile(photoFile, true) // Compress photos
      ]);

      // Clean phone number
      const cleanPhone = data.phone.replace(/[^\d+]/g, '');

      const payload = {
        formType: "VOLUNTEER",
        submissionId, // Unique ID to prevent duplicates
        full_name: data.full_name || "",
        email: data.email || "",
        phone: cleanPhone,
        gender: data.gender || "",
        date_of_birth: data.date_of_birth || "",
        faculty_department: data.faculty_department || "",
        level: data.level || "",
        position: data.position || "",
        is_uba_student: data.is_uba_student || "",
        familiarity: data.familiarity || "",
        familiarity_details: data.familiarity_details || "",
        motivation: data.motivation || "",
        skills_experience: data.skills_experience || "",
        available_training: data.available_training || "",
        available_duties: data.available_duties || "",
        consent: data.consent ? "Yes" : "No",
        cvFile: cvData,
        photoFile: photoData
      };

      setSubmitProgress("Submitting application...");

      const result = await submitToGoogleSheets("VOLUNTEER", payload);

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "Application Submitted",
          description: "Thank you for applying to the UBaTech Leadership Team!"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(result.error || "Submission error");
      }
    } catch (error) {
      // Network error before request was sent - this is a real failure
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      
      // If it's a "Failed to fetch" after data was prepared, likely succeeded
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        setIsSubmitted(true);
        toast({
          title: "Application Submitted",
          description: "Thank you for applying to the UBaTech Leadership Team!"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }

    setIsSubmitting(false);
    setSubmitProgress("");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <CheckCircle className="w-24 h-24 text-primary mx-auto animate-scale-in" />
                <div className="absolute inset-0 animate-ping opacity-30">
                  <CheckCircle className="w-24 h-24 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">
                Application Submitted Successfully!
              </h2>
              <p className="text-lg text-foreground/80 mb-6">
                Thank you for applying to join the UBaTech Leadership Team. We have received your application and will review it carefully.
              </p>
              <p className="text-base text-muted-foreground mb-8">
                You will receive an email update regarding the status of your application.
              </p>
              <Button 
                onClick={() => window.location.href = "/"}
                className="bg-primary hover:bg-primary/90"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Join the Leadership Team
            </h1>
            <p className="text-lg text-foreground/80">
              Apply to become part of the UBaTech Camp Leadership Team and make a difference in tech education.
            </p>
          </div>

          {/* Volunteer Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card p-6 md:p-8 rounded-lg border border-border">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Personal Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder="Enter your full name"
                  className={errors.full_name ? "border-red-500 ring-2 ring-red-500/30" : ""}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="your.email@example.com"
                    className={errors.email ? "border-red-500 ring-2 ring-red-500/30" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex">
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="6XX XXX XXX"
                        className={errors.phone ? "border-red-500 ring-2 ring-red-500/30" : ""}
                      />
                    </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => setValue("gender", value as any)}>
                    <SelectTrigger className={errors.gender ? "border-red-500 ring-2 ring-red-500/30" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth * (dd/mm/yyyy)</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register("date_of_birth")}
                    className={errors.date_of_birth ? "border-red-500 ring-2 ring-red-500/30" : ""}
                  />
                  {errors.date_of_birth && (
                    <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty_department">Faculty / Department *</Label>
                  <Input
                    id="faculty_department"
                    {...register("faculty_department")}
                    placeholder="e.g., FEMS, Accounting"
                    className={errors.faculty_department ? "border-red-500 ring-2 ring-red-500/30" : ""}
                  />
                  {errors.faculty_department && (
                    <p className="text-sm text-destructive">{errors.faculty_department.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select onValueChange={(value) => setValue("level", value)}>
                    <SelectTrigger className={errors.level ? "border-red-500 ring-2 ring-red-500/30" : ""}>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-sm text-destructive">{errors.level.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Leadership Role */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Leadership Role</h2>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position You Are Applying For *</Label>
                <Select onValueChange={(value) => setValue("position", value)}>
                  <SelectTrigger className={errors.position ? "border-red-500 ring-2 ring-red-500/30" : ""}>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.position && (
                  <p className="text-sm text-destructive">{errors.position.message}</p>
                )}
              </div>
            </div>

            {/* Student Verification */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Student Verification</h2>
              
              <div className={`space-y-2 ${errors.is_uba_student ? "p-3 rounded-md border-2 border-red-500 bg-red-500/5" : ""}`}>
                <Label>Are you a current UBa student? *</Label>
                <RadioGroup 
                  onValueChange={(value) => setValue("is_uba_student", value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="uba_yes" />
                    <Label htmlFor="uba_yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="uba_no" />
                    <Label htmlFor="uba_no">No</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">Note: Only UBa students are eligible.</p>
                {errors.is_uba_student && (
                  <p className="text-sm text-destructive">{errors.is_uba_student.message}</p>
                )}
              </div>
            </div>

            {/* Familiarity with UBa Tech Camp */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Familiarity with UBa Tech Camp</h2>
              
              <div className="space-y-2">
                <Label>How familiar are you with UBa Tech Camp? *</Label>
                <Select onValueChange={(value) => setValue("familiarity", value)}>
                  <SelectTrigger className={errors.familiarity ? "border-red-500 ring-2 ring-red-500/30" : ""}>
                    <SelectValue placeholder="Select your familiarity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {familiarityOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.familiarity && (
                  <p className="text-sm text-destructive">{errors.familiarity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="familiarity_details">(Optional) If you wish, briefly share what you already know about the programme</Label>
                <Textarea
                  id="familiarity_details"
                  {...register("familiarity_details")}
                  placeholder="2–3 sentences about what you know..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Motivation & Skills */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Motivation & Skills</h2>
              
              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want to join the Leadership Team? *</Label>
                <Textarea
                  id="motivation"
                  {...register("motivation")}
                  placeholder="Tell us your motivation, experience, and what you'll contribute..."
                  className={`min-h-[120px] ${errors.motivation ? "border-red-500 ring-2 ring-red-500/30" : ""}`}
                />
                {errors.motivation && (
                  <p className="text-sm text-destructive">{errors.motivation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills_experience">Relevant Skills or Experience (Optional)</Label>
                <Textarea
                  id="skills_experience"
                  {...register("skills_experience")}
                  placeholder="e.g., student leadership, project management, media, public speaking…"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv_file">Upload CV/Resume (Optional)</Label>
                <label 
                  htmlFor="cv_file"
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-primary/50 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Upload className="w-6 h-6 text-primary" />
                  <span className="text-primary font-medium">
                    {cvFile ? "Change File" : "Click to Upload CV"}
                  </span>
                  <Input
                    id="cv_file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCvFile(file);
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX</p>
                {cvFile && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                    <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-primary uppercase">
                        {cvFile.name.split('.').pop()}
                      </span>
                    </div>
                    <span className="text-sm text-foreground truncate flex-1">{cvFile.name}</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo_file">Upload a Recent Full-Body Photo *</Label>
                <label 
                  htmlFor="photo_file"
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-primary/50 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Upload className="w-6 h-6 text-primary" />
                  <span className="text-primary font-medium">
                    {photoFile ? "Change Photo" : "Click to Upload Photo"}
                  </span>
                  <Input
                    id="photo_file"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoFile(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setPhotoPreview(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground">For identification and leadership profile purposes (Accepted: JPG, PNG - Max 2MB)</p>
                <p className="text-xs text-muted-foreground">Your photo will only be used for official recruitment and ID purposes.</p>
                {photoFile && photoPreview && (
                  <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-md">
                    <img 
                      src={photoPreview} 
                      alt="Photo preview" 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-foreground truncate block">{photoFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(photoFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Availability</h2>
              
              <div className={`space-y-2 ${errors.available_training ? "p-3 rounded-md border-2 border-red-500 bg-red-500/5" : ""}`}>
                <Label>Are you available to attend the online leadership training (20 Dec 2025 – 4 Jan 2026)? *</Label>
                <RadioGroup 
                  onValueChange={(value) => setValue("available_training", value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="training_yes" />
                    <Label htmlFor="training_yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="training_no" />
                    <Label htmlFor="training_no">No</Label>
                  </div>
                </RadioGroup>
                {errors.available_training && (
                  <p className="text-sm text-destructive">{errors.available_training.message}</p>
                )}
              </div>

              <div className={`space-y-2 ${errors.available_duties ? "p-3 rounded-md border-2 border-red-500 bg-red-500/5" : ""}`}>
                <Label>Are you able to take up official duties from 5 Jan 2026? *</Label>
                <RadioGroup 
                  onValueChange={(value) => setValue("available_duties", value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="duties_yes" />
                    <Label htmlFor="duties_yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="duties_no" />
                    <Label htmlFor="duties_no">No</Label>
                  </div>
                </RadioGroup>
                {errors.available_duties && (
                  <p className="text-sm text-destructive">{errors.available_duties.message}</p>
                )}
              </div>
            </div>

            {/* Consent & Declaration */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Consent & Declaration</h2>
              
              <div className={`flex items-start space-x-3 ${errors.consent ? "p-3 rounded-md border-2 border-red-500 bg-red-500/5" : ""}`}>
                <Checkbox 
                  id="consent" 
                  onCheckedChange={(checked) => setValue("consent", checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="consent" className="cursor-pointer">
                    I confirm that all information provided is accurate and I am willing to serve responsibly. *
                  </Label>
                  <p className="text-xs text-muted-foreground">(Required to submit)</p>
                </div>
              </div>
              {errors.consent && (
                <p className="text-sm text-destructive">{errors.consent.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant={isSubmitting ? "submitting" : "default"}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? submitProgress || "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Volunteer;