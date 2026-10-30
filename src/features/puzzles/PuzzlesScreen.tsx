import React from 'react';
import { Puzzle, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { bn } from '../../i18n/bn.ts';

export const PuzzlesScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-[#FDF6E9] text-[#B87D1B] rounded-2xl flex items-center justify-center text-3xl shadow-xs">
        <Puzzle className="w-8 h-8 text-[#E0A43A]" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-[#1E2420]">{bn.home.featurePuzzles}</h1>
          <Badge variant="accent">{bn.home.comingSoonBadge}</Badge>
        </div>
        <p className="text-sm text-[#6B726D] max-w-md mx-auto leading-relaxed">
          {bn.home.featurePuzzlesDesc}। এই ফিচারটি পরবর্তী আপডেটে সংযুক্ত করা হবে। এখন বটের সাথে খেলা অনুশীলন ও শিক্ষকসুলভ রিভিউ উপভোগ করুন!
        </p>
      </div>

      <Card variant="surface-2" className="p-5 max-w-md mx-auto text-left space-y-2 text-xs text-[#6B726D]">
        <div className="font-semibold text-sm text-[#1E2420] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1F6F50]" />
          <span>পরিকল্পিত সুবিধাগুলো:</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>১ চালে চেকমেট (Mate in 1) এবং ২ চালে চেকমেটের সহজ অনুশীলন</li>
          <li>ঘোড়া ও হাতির ফর্ক (Fork) ধরার কৌশল</li>
          <li>প্রতিটি পাজল সমাধানের পর স্পষ্ট বাংলা সমাধান বিশ্লেষণ</li>
        </ul>
      </Card>

      <div className="pt-2">
        <Button
          onClick={() => navigate('/play')}
          variant="primary"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          {bn.home.startPlayCTA}
        </Button>
      </div>
    </div>
  );
};
