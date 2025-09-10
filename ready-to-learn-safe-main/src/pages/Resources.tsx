import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { Download, Phone, ExternalLink, FileText, Globe, Shield } from "lucide-react";

const emergencyContacts = [
  { name: "Police", number: "100", icon: Shield, color: "primary" },
  { name: "Ambulance", number: "102", icon: Phone, color: "secondary" },
  { name: "Fire Department", number: "101", icon: Phone, color: "accent" },
  { name: "Disaster Management", number: "1078", icon: Phone, color: "primary" },
];

const downloadableResources = [
  {
    title: "Emergency Kit Checklist",
    description: "Complete list of items needed for your emergency preparedness kit",
    type: "PDF",
    size: "2.3 MB",
    icon: FileText
  },
  {
    title: "Family Emergency Plan Template",
    description: "Step-by-step guide to create your family's emergency plan",
    type: "PDF", 
    size: "1.8 MB",
    icon: FileText
  },
  {
    title: "Home Safety Assessment",
    description: "Checklist to evaluate your home's disaster preparedness",
    type: "PDF",
    size: "1.5 MB",
    icon: FileText
  },
  {
    title: "Quick Reference Cards",
    description: "Printable reference cards for each disaster type",
    type: "PDF",
    size: "3.2 MB",
    icon: FileText
  }
];

const officialLinks = [
  {
    title: "National Disaster Management Authority (NDMA)",
    description: "Official government disaster management portal",
    url: "https://ndma.gov.in",
    icon: Globe
  },
  {
    title: "National Disaster Response Force (NDRF)",
    description: "Specialized force for disaster response operations",
    url: "https://ndrf.gov.in",
    icon: Shield
  },
  {
    title: "India Meteorological Department",
    description: "Weather forecasts and early warning systems",
    url: "https://mausam.imd.gov.in",
    icon: Globe
  },
  {
    title: "Disaster Management - MHA",
    description: "Ministry of Home Affairs disaster management resources",
    url: "https://www.mha.gov.in",
    icon: Shield
  }
];

const Resources = () => {
  const handleDownload = (title: string) => {
    // Simulate download
    alert(`Downloading: ${title}`);
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Resource Hub</h1>
            <p className="text-xl text-muted-foreground">Essential resources, contacts, and links for disaster preparedness</p>
          </div>

          {/* Emergency Contacts */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Emergency Contacts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {emergencyContacts.map((contact, index) => (
                <Card 
                  key={index}
                  className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-${contact.color}/20 bg-gradient-to-br from-${contact.color}/5 to-transparent`}
                >
                  <CardContent className="p-6 text-center">
                    <contact.icon className={`h-8 w-8 text-${contact.color} mx-auto mb-3`} />
                    <h3 className="font-semibold text-foreground mb-2">{contact.name}</h3>
                    <div className={`text-2xl font-bold text-${contact.color} mb-4`}>{contact.number}</div>
                    <Button 
                      onClick={() => handleCall(contact.number)}
                      size="sm"
                      className={`bg-${contact.color} text-${contact.color}-foreground hover:bg-${contact.color}/90`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Downloadable Resources */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Downloadable Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {downloadableResources.map((resource, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <resource.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          {resource.title}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">{resource.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{resource.type}</span> • {resource.size}
                      </div>
                      <Button 
                        onClick={() => handleDownload(resource.title)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-accent text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Official Links */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Official Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {officialLinks.map((link, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <link.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          {link.title}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">{link.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      onClick={() => window.open(link.url, '_blank')}
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">Important Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">
                Keep emergency contacts readily available and ensure all family members know how to access them. 
                Print important documents and store them in a waterproof container.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => handleDownload("Complete Emergency Guide")}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Complete Guide
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print This Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Resources;