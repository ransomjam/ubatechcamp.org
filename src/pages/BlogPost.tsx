import React from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();

  // Mock blog post data - in real app this would come from API
  const post = {
    title: "The Future of Web Development: Trends to Watch in 2025",
    content: `
      <p>Web development continues to evolve at a rapid pace, and 2025 promises to bring exciting new trends and technologies that will reshape how we build applications for the web.</p>
      
      <h2>1. AI-Powered Development Tools</h2>
      <p>Artificial Intelligence is revolutionizing the development process. From code generation to automated testing, AI tools are becoming essential for modern developers. GitHub Copilot and similar tools are just the beginning of this transformation.</p>
      
      <h2>2. Edge Computing Integration</h2>
      <p>As applications become more distributed, edge computing is moving processing closer to users. This trend will continue to grow, offering faster response times and better user experiences.</p>
      
      <h2>3. WebAssembly (WASM) Adoption</h2>
      <p>WebAssembly is enabling high-performance applications in the browser, opening up possibilities for complex applications that were previously only possible in native environments.</p>
      
      <h2>4. Progressive Web Apps (PWAs) 2.0</h2>
      <p>PWAs are getting more powerful with new APIs and capabilities, bridging the gap between web and native applications even further.</p>
      
      <h2>Conclusion</h2>
      <p>The future of web development is bright, with these trends pointing towards more powerful, efficient, and user-friendly web applications. At UBa Tech Camp, we're committed to keeping our curriculum updated with these latest developments.</p>
    `,
    author: "Sarah Nakamura",
    date: "2025-01-15",
    category: "Web Development",
    readTime: "5 min read",
    tags: ["Web Development", "AI", "Edge Computing", "WebAssembly", "PWA"],
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Article Header */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link to="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Article Meta */}
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {post.author}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(post.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {post.readTime}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="floating-card">
                <CardContent className="p-8">
                  {/* Featured Image Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-2xl">WD</span>
                      </div>
                      <p className="text-muted-foreground">Featured Image</p>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Tags */}
                  <div className="mt-8 pt-8 border-t">
                    <h4 className="font-semibold mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Card */}
              <Card className="floating-card">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">About the Author</h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">SN</span>
                    </div>
                    <div>
                      <h5 className="font-medium">{post.author}</h5>
                      <p className="text-sm text-muted-foreground">Program Director</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Former Google engineer with 15+ years in tech education and software architecture.
                  </p>
                </CardContent>
              </Card>

              {/* Related Posts */}
              <Card className="floating-card">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Related Posts</h4>
                  <div className="space-y-4">
                    {[
                      "Building Your First React App",
                      "Mobile Development Trends",
                      "Data Science Career Guide"
                    ].map((title, index) => (
                      <div key={index} className="pb-4 border-b last:border-b-0">
                        <h5 className="font-medium text-sm mb-1">{title}</h5>
                        <p className="text-xs text-muted-foreground">3 min read</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter CTA */}
              <Card className="floating-card bg-primary text-white">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Stay Updated</h4>
                  <p className="text-sm text-white/90 mb-4">
                    Get the latest tech insights and bootcamp updates
                  </p>
                  <Button variant="secondary" size="sm" className="w-full">
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;