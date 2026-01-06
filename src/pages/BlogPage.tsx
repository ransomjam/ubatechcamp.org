import React from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import practicalSession from "@/assets/newphotos/Practical sessions.png";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 hero-gradient text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
            Tech Insights
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            UBa Tech Blog
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Insights, tutorials, and success stories from Cameroon's leading tech bootcamp
          </p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-8 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Article Container */}
          <article className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 overflow-hidden">
            
            {/* Featured Image at Top */}
            <div className="w-full aspect-video md:aspect-[21/9] overflow-hidden">
              <img 
                src={practicalSession} 
                alt="UBa Tech Camp students in practical session" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-10 lg:p-12">
              
              {/* Post Header */}
              <header className="mb-8">
                <Badge variant="secondary" className="mb-4">
                  Recruitment
                </Badge>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                  UBa Tech Camp Volunteer Leadership Recruitment
                </h2>
                <p className="text-lg md:text-xl text-primary font-semibold mb-6">
                  Lead. Learn. Excel. Make an Impact.
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm border-b border-border pb-6">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    UBa Tech Camp Team
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    December 2, 2025
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    8 min read
                  </div>
                </div>
              </header>

              {/* Article Body */}
              <div className="text-foreground space-y-8">
                
                {/* Introduction */}
                <div className="text-base md:text-lg leading-relaxed space-y-4">
                  <p>
                    UBa Tech Camp is opening its doors to a new cohort of committed student leaders. As our digital skills initiative grows across the University of Bamenda, we are selecting exceptional students who are ready to lead, innovate, and contribute to one of the most impactful student programmes on campus.
                  </p>
                  <p>
                    This is more than volunteering. It is a leadership opportunity that builds your CV, strengthens your abilities, and positions you for future academic and career success.
                  </p>
                </div>

                {/* Why You Should Apply */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                    Why You Should Apply
                  </h3>
                  <p className="mb-4">
                    Joining the UBa Tech Camp Leadership Team offers you the chance to:
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Build real leadership experience recognised across faculties and student organisations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Develop professional skills in project management, communication, community engagement, and teamwork</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Work alongside a dynamic, high-impact team driving digital transformation at UBa</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Receive structured training that prepares you for internships, scholarships, and graduate opportunities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Make a meaningful difference by helping hundreds of students access digital skills that change their future</span>
                    </li>
                  </ul>
                  <p className="font-semibold text-primary">
                    If you want to grow, lead, and leave a legacy, this is your opportunity.
                  </p>
                </section>

                {/* Available Roles */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                    Available Volunteer Leadership Roles
                  </h3>
                  <div className="space-y-4">
                    <div className="p-5 bg-muted/30 rounded-xl border border-border/50">
                      <h4 className="font-bold text-foreground mb-2">1. Programme and Training Manager (Volunteer)</h4>
                      <p className="text-muted-foreground">Lead training operations, coordinate facilitators, ensure smooth programme delivery, and uphold high academic and operational standards.</p>
                    </div>
                    <div className="p-5 bg-muted/30 rounded-xl border border-border/50">
                      <h4 className="font-bold text-foreground mb-2">2. Student Community Manager (Volunteer)</h4>
                      <p className="text-muted-foreground">Oversee learner communication, manage support channels, and maintain strong engagement throughout all training activities.</p>
                    </div>
                    <div className="p-5 bg-muted/30 rounded-xl border border-border/50">
                      <h4 className="font-bold text-foreground mb-2">3. Media and Communications Lead (Volunteer)</h4>
                      <p className="text-muted-foreground">Shape the visual and digital voice of UBa Tech Camp. Create compelling content and elevate the camp's presence online and on campus.</p>
                    </div>
                    <div className="p-5 bg-muted/30 rounded-xl border border-border/50">
                      <h4 className="font-bold text-foreground mb-2">4. Public Relations Officer (Volunteer)</h4>
                      <p className="text-muted-foreground">Build and strengthen partnerships across departments, clubs, and institutions. Drive outreach, recruitment, and community visibility.</p>
                    </div>
                  </div>
                </section>

                {/* Who We're Looking For */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                    Who We Are Looking For
                  </h3>
                  <p className="mb-4">Applicants must:</p>
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Be enrolled at the University of Bamenda</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Be responsible, reliable, and ready to learn</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Be willing to volunteer time and effort</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Communicate confidently and work well in teams</span>
                    </li>
                  </ul>
                  <p className="mb-4">Students from all faculties are strongly encouraged to apply.</p>
                  <p className="font-semibold text-primary">
                    If you are dedicated, ambitious, and eager to be part of something meaningful, you are exactly who we want.
                  </p>
                </section>

                {/* Leadership Training */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                    Leadership Training Included
                  </h3>
                  <p className="mb-4">
                    Shortlisted candidates will undergo a two-week professional development programme covering:
                  </p>
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Practical project management</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Communication and leadership essentials</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Role-specific duties and expectations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span>Real-world teamwork and operations</span>
                    </li>
                  </ul>
                  <p>
                    Successful completion leads to official appointment into your role. <span className="font-semibold">This training strengthens your CV and boosts your future opportunities.</span>
                  </p>
                </section>

                {/* Key Dates */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                    Key Dates
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-border/50">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-4 font-semibold text-foreground">Activity</th>
                          <th className="text-left p-4 font-semibold text-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        <tr>
                          <td className="p-4">Applications Open</td>
                          <td className="p-4">2 December 2025</td>
                        </tr>
                        <tr className="bg-muted/20">
                          <td className="p-4">Application Deadline</td>
                          <td className="p-4">10 December 2025</td>
                        </tr>
                        <tr>
                          <td className="p-4">Shortlist Announcement</td>
                          <td className="p-4">15 December 2025</td>
                        </tr>
                        <tr className="bg-muted/20">
                          <td className="p-4">Leadership Training</td>
                          <td className="p-4">20 Dec 2025 to 4 Jan 2026</td>
                        </tr>
                        <tr>
                          <td className="p-4">Official Duties Begin</td>
                          <td className="p-4">5 January 2026</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-muted-foreground mt-4">
                    Updates will be shared via official channels and email.
                  </p>
                </section>

                {/* How to Apply */}
                <section>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                    How to Apply
                  </h3>
                  <div className="p-5 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                    <p className="flex items-start gap-3">
                      <span className="font-semibold text-primary">Step 1:</span>
                      <span>Visit ubatechcamp.org</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="font-semibold text-primary">Step 2:</span>
                      <span>Open the Menu</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="font-semibold text-primary">Step 3:</span>
                      <span>Select <strong>Volunteer</strong></span>
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="font-semibold text-primary">Step 4:</span>
                      <span>Submit your details and select your preferred role</span>
                    </p>
                  </div>
                  <p className="font-semibold mt-4">
                    Applications are reviewed as they come in. Early applications are encouraged.
                  </p>
                </section>

                {/* Call to Action Box */}
                <section className="p-6 md:p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    Lead with Confidence. Grow with Purpose. Create Impact.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    UBa Tech Camp is shaping the next generation of student leaders through technology, innovation, and service. If you have the passion to lead and the drive to make a difference, this is your moment.
                  </p>
                  <p className="text-primary font-semibold">
                    Join the leadership team empowering digital skills across UBa.
                  </p>
                  <p className="text-lg font-bold text-foreground mt-2">
                    Your Skills Today, Your Success Tomorrow.
                  </p>
                </section>

                {/* Apply Button - Bottom Left */}
                <div className="pt-6 border-t border-border">
                  <Link to="/volunteer-console">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Executive & Tutor Console
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
