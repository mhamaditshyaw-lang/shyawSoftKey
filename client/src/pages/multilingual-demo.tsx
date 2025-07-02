import { useTranslation } from "react-i18next";
import { MultilingualRoleDemo } from "@/components/examples/multilingual-role-demo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Globe, Shield, Check } from "lucide-react";

export default function MultilingualDemoPage() {
  const { t, i18n } = useTranslation();

  const features = [
    {
      icon: <Globe className="w-5 h-5" />,
      title: i18n.language === 'ku' ? "پشتگیری زمانی دووگانە" : "Bilingual Support",
      description: i18n.language === 'ku' 
        ? "پشتگیری تەواو بۆ کوردی و ئینگلیزی لەگەڵ گۆڕینی ڕاستەوخۆی زمان"
        : "Full support for Kurdish and English with real-time language switching",
      status: "implemented"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: i18n.language === 'ku' ? "کۆنترۆڵی دەستگەیشتن بەپێی ڕۆڵ" : "Role-Based Access Control",
      description: i18n.language === 'ku' 
        ? "سێ ڕۆڵی جیاواز: بەڕێوەبەر، مانەجەر، و ئاسایش"
        : "Three distinct roles: Admin, Manager, and Security",
      status: "implemented"
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: i18n.language === 'ku' ? "کۆدی پاک و ڕێکخراو" : "Clean & Modular Code",
      description: i18n.language === 'ku' 
        ? "کۆمپۆنێنتە فەنکشناڵەکان لەگەڵ هوکە تایبەتەکان"
        : "Functional components with custom hooks",
      status: "implemented"
    }
  ];

  const codeExample = `// Example: Using translation hooks
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';

export function MyComponent() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  return (
    <div>
      <h1>{t("welcomeBack")}</h1>
      <Badge>{t(user?.role || "guest")}</Badge>
      <p>Current language: {i18n.language}</p>
    </div>
  );
}

// Add more translations in /src/lib/i18n.ts
// Kurdish: زمانی کوردی (Kurdish Language)
// Proper Unicode support with RTL capability`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          {i18n.language === 'ku' 
            ? "نمونەی سیستەمی زمان و ڕۆڵ" 
            : "Multilingual & Role-Based System Demo"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {i18n.language === 'ku' 
            ? "ئەم پەڕەیە نمونەی تەواوی سیستەمی زماندووگانەو کۆنترۆڵی ڕۆڵ پیشان دەدات"
            : "This page demonstrates the complete bilingual support and role-based access control system"}
        </p>
      </div>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            {i18n.language === 'ku' ? "تایبەتمەندییەکانی جێبەجێکراو" : "Implemented Features"}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'ku' 
              ? "هەموو تایبەتمەندییەکان تەواو و ئامادەن"
              : "All features are fully implemented and ready to use"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.status === 'implemented' 
                      ? (i18n.language === 'ku' ? "جێبەجێکراو" : "Ready")
                      : (i18n.language === 'ku' ? "چاوەڕێ" : "Pending")}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            {i18n.language === 'ku' ? "نمونەی کۆد" : "Code Example"}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'ku' 
              ? "چۆنیەتی بەکارهێنانی سیستەمی زمان و ڕۆڵەکان"
              : "How to use the multilingual and role-based system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{codeExample}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <MultilingualRoleDemo />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'ku' ? "چۆنیەتی بەکارهێنان" : "How to Use"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge className="mt-1">1</Badge>
              <div>
                <h4 className="font-semibold">
                  {i18n.language === 'ku' ? "گۆڕینی زمان" : "Language Switching"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'ku' 
                    ? "لە سەرەوەی پەڕە کلیک لە گۆڕەری زمان بکە"
                    : "Click the language switcher at the top of the page"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="mt-1">2</Badge>
              <div>
                <h4 className="font-semibold">
                  {i18n.language === 'ku' ? "کۆنترۆڵی ڕۆڵ" : "Role-Based Control"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'ku' 
                    ? "هەر ڕۆڵێک دەستگەیشتنی جیاوازی هەیە بە لاپەڕەکان"
                    : "Each role has different access to pages and features"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="mt-1">3</Badge>
              <div>
                <h4 className="font-semibold">
                  {i18n.language === 'ku' ? "پیشاندانی ڕاستەوخۆ" : "Real-time Updates"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'ku' 
                    ? "هەموو گۆڕانکارییەکان بەیەکجار پیشان دەدرێن"
                    : "All changes are displayed immediately without page refresh"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}