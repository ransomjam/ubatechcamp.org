import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const FAQSection = () => {
  const faqs = [
    {
      question: "Who can join UBa Tech Camp?",
      answer: "UBa Tech Camp is open to all students at the University of Bamenda who are eager to gain practical digital skills. No prior experience is required - just bring your motivation to learn!"
    },
    {
      question: "What will I learn at the camp?",
      answer: "We offer programs in Data Analysis and Research (data collection, statistical analysis, Excel and Stata), Computer & MS Office Basics (Word, Excel, PowerPoint), Software Engineering (programming fundamentals, clean code, Git), Web Development (HTML, CSS, JavaScript), and Data Analytics (Excel, SQL, Python, Power BI). Each program focuses on practical, hands-on training with real-world applications."
    },
    {
      question: "How long is the camp?",
      answer: "The camp runs for 4 weeks with intensive daily sessions from 9:00 AM to 4:00 PM. You'll also work on mini projects every weekend to apply what you've learned. The program includes a comprehensive final assessment."
    },
    {
      question: "What is the cost of the program?",
      answer: "The UBa Tech Camp is offered free of charge to students! The program is supported by voluntary contributions from our founder and facilitators. You only need to bring a USB flash drive and a laptop if you have one."
    },
    {
      question: "Do I need to bring my own laptop?",
      answer: "While having your own laptop is helpful, it's not required. Students work in small groups and share laptops when needed. This collaborative approach has proven to strengthen teamwork and peer learning."
    },
    {
      question: "Will I receive a certificate?",
      answer: "Yes! All students will be certified based on their performance in the final UBaTech Camp exams. Upon successful completion of the camp and the final assessment, you'll receive a certificate. You'll also have completed multiple projects showcasing your new skills."
    },
    {
      question: "How often is the camp offered?",
      answer: "We're planning to organize the camp on a quarterly basis to reach more students throughout the year. Follow our social media (Facebook & LinkedIn: UBa Tech Camp) for announcements about upcoming sessions."
    },
    {
      question: "Where is the camp located?",
      answer: "The camp is held at UBaDef Hall 3, University of Bamenda, Bambili, Cameroon. The venue is accessible and provides an ideal setting for collaborative learning."
    },
    {
      question: "What are the daily activities like?",
      answer: "Sessions run from 9:00 AM to 4:00 PM with a mix of hands-on practice, group work, and facilitator guidance. You'll alternate between software training and data analysis. Weekends feature mini projects that combine all your new skills."
    },
    {
      question: "Can I get help after the camp ends?",
      answer: "Yes! We're building a peer mentorship model where past participants return as mentors. You'll also join our growing alumni community with access to continued learning opportunities and digital entrepreneurship support."
    }
  ];

  return (
    <section id="faq" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-primary">
              Frequently Asked Questions
            </h2>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border rounded-lg px-4 bg-card hover:border-primary transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-semibold text-sm pr-3">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 text-xs leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

      </div>
    </section>
  );
};
