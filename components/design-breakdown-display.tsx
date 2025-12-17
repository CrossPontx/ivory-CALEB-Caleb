'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Clock, 
  Palette, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface DesignBreakdownDisplayProps {
  bookingId: number;
  lookId?: number;
}

export function DesignBreakdownDisplay({ bookingId, lookId }: DesignBreakdownDisplayProps) {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'designProcess']));

  useEffect(() => {
    if (lookId) {
      fetchBreakdown();
    } else {
      setLoading(false);
    }
  }, [bookingId, lookId]);

  const fetchBreakdown = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/design-breakdown?lookId=${lookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBreakdown(data.breakdown);
      }
    } catch (error) {
      console.error('Error fetching breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings/generate-breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      if (response.ok) {
        const data = await response.json();
        setBreakdown(data.breakdown);
      }
    } catch (error) {
      console.error('Error generating breakdown:', error);
      alert('Failed to generate breakdown');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!lookId) {
    return null;
  }

  if (loading) {
    return (
      <Card className="border-[#E8E8E8]">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B7355]" />
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card className="border-2 border-[#8B7355]/20 bg-gradient-to-br from-[#8B7355]/5 to-[#8B7355]/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white border border-[#E8E8E8] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#8B7355]" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight">
                AI Design Breakdown
              </CardTitle>
              <CardDescription className="text-sm text-[#6B6B6B] font-light">
                Get detailed technical instructions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mb-6">
            Generate a comprehensive, step-by-step breakdown of this nail design with professional terminology, 
            product recommendations, and pro tips.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 h-11 text-xs tracking-widest uppercase rounded-none font-light"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Breakdown
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const data = breakdown.breakdown;
  const difficultyColor = 
    data.difficulty === 'beginner' ? 'text-green-600' :
    data.difficulty === 'intermediate' ? 'text-yellow-600' :
    'text-red-600';

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-2 border-[#8B7355]/20 bg-gradient-to-br from-[#8B7355]/5 to-[#8B7355]/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border border-[#E8E8E8] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#8B7355]" />
              </div>
              <div>
                <CardTitle className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight">
                  AI Design Breakdown
                </CardTitle>
                <CardDescription className="text-sm text-[#6B6B6B] font-light">
                  Professional technical analysis
                </CardDescription>
              </div>
            </div>
            <Badge className={`${difficultyColor} bg-white border-2`}>
              {data.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/50 border border-[#E8E8E8]">
            <Clock className="w-5 h-5 text-[#8B7355]" />
            <div>
              <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">Estimated Time</p>
              <p className="text-sm font-light text-[#1A1A1A]">{data.estimatedTime} minutes</p>
            </div>
          </div>
          {data.overview?.colorPalette && data.overview.colorPalette.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-white/50 border border-[#E8E8E8]">
              <Palette className="w-5 h-5 text-[#8B7355]" />
              <div>
                <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">Colors</p>
                <p className="text-sm font-light text-[#1A1A1A]">{data.overview.colorPalette.length} colors</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overview Section */}
      {data.overview && (
        <Card className="border-[#E8E8E8]">
          <CardHeader 
            className="cursor-pointer hover:bg-[#F8F7F5] transition-colors"
            onClick={() => toggleSection('overview')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight">
                Design Overview
              </CardTitle>
              {expandedSections.has('overview') ? (
                <ChevronUp className="w-5 h-5 text-[#6B6B6B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B6B6B]" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('overview') && (
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Style</p>
                <p className="text-sm text-[#1A1A1A] font-light">{data.overview.style}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Nail Shape</p>
                  <p className="text-sm text-[#1A1A1A] font-light">{data.overview.nailShape}</p>
                </div>
                <div>
                  <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Length</p>
                  <p className="text-sm text-[#1A1A1A] font-light">{data.overview.length}</p>
                </div>
              </div>
              {data.overview.colorPalette && data.overview.colorPalette.length > 0 && (
                <div>
                  <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Color Palette</p>
                  <div className="flex flex-wrap gap-2">
                    {data.overview.colorPalette.map((color: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="font-light">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Design Process Section */}
      {data.designProcess && data.designProcess.length > 0 && (
        <Card className="border-[#E8E8E8]">
          <CardHeader 
            className="cursor-pointer hover:bg-[#F8F7F5] transition-colors"
            onClick={() => toggleSection('designProcess')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight">
                Step-by-Step Process
              </CardTitle>
              {expandedSections.has('designProcess') ? (
                <ChevronUp className="w-5 h-5 text-[#6B6B6B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B6B6B]" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('designProcess') && (
            <CardContent className="space-y-6">
              {data.designProcess.map((step: any, idx: number) => (
                <div key={idx} className="border-l-2 border-[#8B7355] pl-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#8B7355] text-white flex items-center justify-center text-sm font-light flex-shrink-0">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-light text-[#1A1A1A] mb-1">{step.title}</h4>
                      {step.duration && (
                        <p className="text-xs text-[#6B6B6B] font-light mb-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {step.duration}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#6B6B6B] font-light leading-relaxed mb-2">
                    {step.description}
                  </p>
                  {step.tips && (
                    <div className="bg-[#F8F7F5] p-3 mt-2">
                      <p className="text-xs tracking-wider uppercase text-[#8B7355] mb-1 font-light">Pro Tip</p>
                      <p className="text-sm text-[#1A1A1A] font-light">{step.tips}</p>
                    </div>
                  )}
                  {step.cureTime && (
                    <p className="text-xs text-[#8B7355] mt-2 font-light">
                      ⏱️ Cure: {step.cureTime}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Products & Tools Section */}
      <Card className="border-[#E8E8E8]">
        <CardHeader 
          className="cursor-pointer hover:bg-[#F8F7F5] transition-colors"
          onClick={() => toggleSection('products')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight">
              Products & Tools
            </CardTitle>
            {expandedSections.has('products') ? (
              <ChevronUp className="w-5 h-5 text-[#6B6B6B]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#6B6B6B]" />
            )}
          </div>
        </CardHeader>
        {expandedSections.has('products') && (
          <CardContent className="space-y-6">
            {data.productsNeeded && data.productsNeeded.length > 0 && (
              <div>
                <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-3 font-light flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Products Needed
                </p>
                <div className="space-y-4">
                  {data.productsNeeded.map((category: any, idx: number) => (
                    <div key={idx}>
                      <p className="text-sm font-light text-[#1A1A1A] mb-2">{category.category}</p>
                      <ul className="space-y-1 ml-4">
                        {category.items.map((item: string, itemIdx: number) => (
                          <li key={itemIdx} className="text-sm text-[#6B6B6B] font-light flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#8B7355] flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.toolsNeeded && data.toolsNeeded.length > 0 && (
              <div>
                <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-3 font-light flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tools Needed
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.toolsNeeded.map((tool: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="font-light">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Pro Tips Section */}
      {data.proTips && data.proTips.length > 0 && (
        <Card className="border-[#E8E8E8] bg-gradient-to-br from-green-50/50 to-emerald-50/50">
          <CardHeader 
            className="cursor-pointer hover:bg-white/50 transition-colors"
            onClick={() => toggleSection('proTips')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Pro Tips
              </CardTitle>
              {expandedSections.has('proTips') ? (
                <ChevronUp className="w-5 h-5 text-[#6B6B6B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B6B6B]" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('proTips') && (
            <CardContent className="space-y-3">
              {data.proTips.map((tip: any, idx: number) => (
                <div key={idx} className="bg-white p-3 border border-green-200">
                  <p className="text-xs tracking-wider uppercase text-green-600 mb-1 font-light">
                    {tip.category}
                  </p>
                  <p className="text-sm text-[#1A1A1A] font-light">{tip.tip}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Common Mistakes Section */}
      {data.commonMistakes && data.commonMistakes.length > 0 && (
        <Card className="border-[#E8E8E8] bg-gradient-to-br from-red-50/50 to-rose-50/50">
          <CardHeader 
            className="cursor-pointer hover:bg-white/50 transition-colors"
            onClick={() => toggleSection('mistakes')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Common Mistakes to Avoid
              </CardTitle>
              {expandedSections.has('mistakes') ? (
                <ChevronUp className="w-5 h-5 text-[#6B6B6B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B6B6B]" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('mistakes') && (
            <CardContent className="space-y-3">
              {data.commonMistakes.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-3 border border-red-200">
                  <p className="text-sm font-light text-red-600 mb-1">❌ {item.mistake}</p>
                  <p className="text-sm text-[#1A1A1A] font-light">✓ {item.solution}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
