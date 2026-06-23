import { useState, type FormEvent, useRef } from 'react';
import TrueFocus from './components/ui/TrueFocus';
import TextType from './components/ui/TextType';
import ClickSpark from './components/ui/ClickSpark';

import './App.css';

type Language = 'en' | 'de';
type TabId = 'attendance' | 'wheel1' | 'wheel2' | 'groups';

const INITIAL_STUDENTS = [
  { id: 1, name: "Artem", present: true },
  { id: 2, name: "Ivan", present: true },
  { id: 3, name: "Roman", present: true },
  { id: 4, name: "Andrii K", present: true },
  { id: 5, name: "Vlad", present: true },
  { id: 6, name: "Oleg", present: true },
  { id: 7, name: "Denys", present: true },
  { id: 8, name: "Marsel", present: true },
  { id: 9, name: "Andrii R", present: true },
  { id: 10, name: "Andrii P", present: true },
  { id: 11, name: "Alexander", present: true },
  { id: 12, name: "Vitalii", present: true },
  { id: 13, name: "Ilarii", present: true },
  { id: 14, name: "Nadya", present: true },
  { id: 15, name: "Jasmina", present: true },
  { id: 16, name: "Oleksiy", present: true },
  { id: 17, name: "Kostyantyn", present: true },
  { id: 18, name: "Vladyslav", present: true },
];

const dict = {
  en: {
    hero_phrases: ["Speak even if it’s wrong.", "Your future self will thank you."],
    tab_attendance: "Attendance",
    tab_wheel1: "Single Wheel",
    tab_wheel2: "Double Wheel",
    tab_groups: "Groups",
    attendance_title: "Class List",
    attendance_desc: "Mark absent students (they won't participate in the randomizer)",
    present: "Present",
    absent: "Absent",
    wheel_students_left: "Students in wheel:",
    spin_student: "Spin Student",
    spin_both: "Spin Both Wheels",
    spinning: "Spinning...",
    remove_from_wheel: "Remove from wheel",
    reset_wheel: "Reset wheel (bring all back)",
    add_question_ph: "Type a topic or question...",
    add: "Add",
    remove_topic: "Remove topic",
    empty_wheel: "Empty",
    groups_count: "Number of groups",
    active_students: "Total active students:",
    generate: "Generate",
    group: "Group",
    people: "people",
    topics_title: "Topics"
  },
  de: {
    hero_phrases: ["Jeden Tag ein bisschen besser.", "Übung macht den Meister."],
    tab_attendance: "Anwesenheit",
    tab_wheel1: "Ein Rad",
    tab_wheel2: "Zwei Räder",
    tab_groups: "Gruppen",
    attendance_title: "Klassenliste",
    attendance_desc: "Markieren Sie abwesende Schüler (sie nehmen nicht am Zufallsgenerator teil)",
    present: "Anwesend",
    absent: "Abwesend",
    wheel_students_left: "Schüler im Rad:",
    spin_student: "Schüler drehen",
    spin_both: "Beide Räder drehen",
    spinning: "Dreht sich...",
    remove_from_wheel: "Aus dem Rad entfernen",
    reset_wheel: "Rad zurücksetzen (alle zurückholen)",
    add_question_ph: "Thema oder Frage eingeben...",
    add: "Hinzufügen",
    remove_topic: "Thema entfernen",
    empty_wheel: "Leer",
    groups_count: "Anzahl der Gruppen",
    active_students: "Aktive Schüler gesamt:",
    generate: "Generieren",
    group: "Gruppe",
    people: "Personen",
    topics_title: "Themen"
  }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getRandomStartRotation = () => Math.floor(Math.random() * 360);

const SECTION_LABEL_CLASS = 'text-gray-200 text-xl md:text-2xl font-bold font-body';

const WHEEL_SIZES = {
  single: 'w-72 h-72 sm:w-80 sm:h-80 md:w-[26rem] md:h-[26rem]',
  double: 'w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[26rem] lg:h-[26rem]',
} as const;

const WheelVisual = ({
  items,
  rotation,
  isSpinning,
  emptyLabel = 'Empty',
  size = 'single',
}: {
  items: { id: string | number; label: string }[];
  rotation: number;
  isSpinning: boolean;
  emptyLabel?: string;
  size?: keyof typeof WHEEL_SIZES;
}) => {
  const sizeClass = WHEEL_SIZES[size];

  if (items.length === 0) {
    return (
      <div className={`relative ${sizeClass} max-w-full mx-auto`}>
        <div className="w-full h-full rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
          <span className="text-slate-400 text-2xl font-semibold">{emptyLabel}</span>
        </div>
      </div>
    );
  }

  const step = 360 / items.length;

  const colors = [
  'rgba(255, 59,  59,  0.75)',
  'rgba(52,  211, 153, 0.75)',
  'rgba(251, 146, 60,  0.75)',
  'rgba(96,  165, 250, 0.75)',
  'rgba(196, 121, 255, 0.75)',
  'rgba(250, 204, 21,  0.75)',
  'rgba(20,  184, 166, 0.75)',
];

  const gradientStr = items.map((_, i) => {
    const color = colors[i % colors.length];
    return `${color} ${i * step}deg ${(i + 1) * step}deg`;
  }).join(', ');

  const fontSizeClass = size === 'single' ? 'text-base md:text-lg' : 'text-sm md:text-base lg:text-lg';
  const labelTop = '4%';
  const labelHeight = '38%';

  return (
    <div className={`relative ${sizeClass} max-w-full mx-auto`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 text-white drop-shadow-md pointer-events-none">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="md:w-10 md:h-10">
          <path d="M12 2L20 12H4L12 2Z" />
        </svg>
      </div>
      <div 
        className="w-full h-full rounded-full border-2 border-white/20 overflow-hidden relative"
        style={{ 
          background: `conic-gradient(${gradientStr})`,
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none'
        }}
      >
        {items.length > 1 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            style={{ zIndex: 5 }}
          >
            {items.map((_, i) => {
              const angle = i * step;
              const radians = ((angle - 90) * Math.PI) / 180;
              const x2 = 50 + 50 * Math.cos(radians);
              const y2 = 50 + 50 * Math.sin(radians);
              return (
                <line
                  key={i}
                  x1="50" y1="50"
                  x2={x2} y2={y2}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.6"
                />
              );
            })}
          </svg>
        )}
      
        {items.map((item, i) => {
          const angle = (i * step) + (step / 2);
          const displayLabel = item.label.trim();

          return (
            <div
              key={item.id}
              className="absolute inset-0 pointer-events-none"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2 overflow-hidden flex items-end justify-center pb-5 md:pb-8"
                style={{ top: labelTop, height: labelHeight }}
              >
                <span
                  className={`text-white ${fontSizeClass} font-semibold tracking-wide drop-shadow-md inline-block`}
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxHeight: '100%',
                    lineHeight: 1.15,
                  }}
                  title={item.label}
                >
                  {displayLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-[#0c1922] border-2 border-white/20 rounded-full z-10 shadow-inner pointer-events-none" />
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = dict[lang];

  const [activeTab, setActiveTab] = useState<TabId>('wheel2');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  
  // Изолированные состояния для списков студентов
  const [wheel1Students, setWheel1Students] = useState(INITIAL_STUDENTS.filter(s => s.present));
  const [wheel2Students, setWheel2Students] = useState(INITIAL_STUDENTS.filter(s => s.present));
  
  const [questions, setQuestions] = useState<{id: string, text: string}[]>([]);
  const [newQuestionStr, setNewQuestionStr] = useState("");

  const spinSoundRef = useRef<HTMLAudioElement>(new Audio(import.meta.env.BASE_URL + 'spin.mp3'));

  const toggleStudentPresence = (id: number) => {
    setStudents(prevStudents => {
      const target = prevStudents.find(s => s.id === id);
      if (!target) return prevStudents;

      const nextPresent = !target.present;
      
      const updateWheelPool = (prevWheel: typeof INITIAL_STUDENTS) => {
        if (!nextPresent) return prevWheel.filter(s => s.id !== id);
        return prevWheel.some(s => s.id === id) ? prevWheel : [...prevWheel, { ...target, present: true }];
      };

      // Синхронизируем оба колеса при изменении присутствия
      setWheel1Students(updateWheelPool);
      setWheel2Students(updateWheelPool);

      return prevStudents.map(st => st.id === id ? { ...st, present: nextPresent } : st);
    });
  };

  const [spinning1, setSpinning1] = useState(false);
  const [rotation1, setRotation1] = useState(0);
  const [resultStudent, setResultStudent] = useState<{ id: number, name: string } | null>(null);
  
  const [spinning2, setSpinning2] = useState(false);
  const [rotation2, setRotation2] = useState(0);
  const [resultQuestion, setResultQuestion] = useState<{id: string, text: string} | null>(null);

  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState<typeof INITIAL_STUDENTS[]>([]);

  const handleSpinLeft = () => {
    if (wheel1Students.length === 0 || spinning1) return;
    setSpinning1(true);
    setResultStudent(null);

    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(e => console.log("Sound play blocked", e));
    }

    const winnerIndex = Math.floor(Math.random() * wheel1Students.length);
    const sliceAngle = 360 / wheel1Students.length;
    
    const targetAngle = 360 - ((winnerIndex * sliceAngle) + (sliceAngle / 2));
    
    setRotation1(prev => {
      const currentMod = prev % 360;
      let diff = targetAngle - currentMod;
      if (diff < 0) diff += 360;
      return prev + (360 * 5) + diff;
    });

    setTimeout(() => {
      setResultStudent(wheel1Students[winnerIndex]);
      setSpinning1(false);
      
      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
      }
    }, 4000); 
  };

  const handleSpinBoth = () => {
    if (wheel2Students.length === 0 || questions.length === 0 || spinning1 || spinning2) return;

    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(e => console.log("Sound play blocked", e));
    }

    setSpinning1(true); setResultStudent(null);
    const winnerIndex1 = Math.floor(Math.random() * wheel2Students.length);
    const sliceAngle1 = 360 / wheel2Students.length;
    
    const targetAngle1 = 360 - ((winnerIndex1 * sliceAngle1) + (sliceAngle1 / 2));
    setRotation1(prev => {
      const currentMod = prev % 360;
      let diff = targetAngle1 - currentMod;
      if (diff < 0) diff += 360;
      return prev + (360 * 5) + diff; 
    });
    
    setSpinning2(true); setResultQuestion(null);
    const winnerIndex2 = Math.floor(Math.random() * questions.length);
    const sliceAngle2 = 360 / questions.length;
    
    const targetAngle2 = 360 - ((winnerIndex2 * sliceAngle2) + (sliceAngle2 / 2));
    setRotation2(prev => {
      const currentMod = prev % 360;
      let diff = targetAngle2 - currentMod;
      if (diff < 0) diff += 360;
      return prev + (360 * 6) + diff;
    });

    setTimeout(() => {
      setResultStudent(wheel2Students[winnerIndex1]);
      setResultQuestion(questions[winnerIndex2]);
      setSpinning1(false);
      setSpinning2(false);

      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
      }
    }, 4000);
  };

  const generateGroups = () => {
    const present = students.filter(s => s.present);
    if (present.length === 0 || groupCount < 1) return;
    const shuffled = shuffleArray(present);
    const newGroups = Array.from({ length: groupCount }, () => [] as typeof INITIAL_STUDENTS);
    shuffled.forEach((student, index) => { newGroups[index % groupCount].push(student); });
    setGroups(newGroups);
  };

  const handleAddQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!newQuestionStr.trim()) return;
    setQuestions([...questions, { id: Date.now().toString(), text: newQuestionStr.trim() }]);
    setNewQuestionStr("");
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'attendance', label: t.tab_attendance },
    { id: 'wheel1', label: t.tab_wheel1 },
    { id: 'wheel2', label: t.tab_wheel2 },
    { id: 'groups', label: t.tab_groups },
  ];

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="relative min-h-screen font-body text-white selection:bg-white/20 overflow-x-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <video autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" />
        </div>
        <nav className="relative z-10 flex justify-between items-center px-6 md:px-8 py-6 max-w-7xl mx-auto">
          <div className="text-3xl md:text-4xl tracking-tight h-10 flex items-center">
              <TrueFocus 
                  sentence="busiest man"
                  manualMode={false}
                  blurAmount={3}
                  borderColor="#fff"
                  glowColor="rgba(255, 255, 255, 0.6)"
                  animationDuration={0.5}
                  pauseBetweenAnimations={6}
              />
          </div>

          <div className="hidden md:flex space-x-8 text-base md:text-lg font-semibold text-gray-300">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`hover:text-white transition-colors ${activeTab === tab.id ? 'text-white border-b-2 border-white pb-1' : ''}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="liquid-glass rounded-full flex text-xs font-medium cursor-pointer relative z-20">
            <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-full transition-colors ${lang === 'en' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}>EN</button>
            <button onClick={() => setLang('de')} className={`px-4 py-2 rounded-full transition-colors ${lang === 'de' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}>DE</button>
          </div>
        </nav>
        <div className="md:hidden flex overflow-x-auto px-6 gap-4 pb-4 no-scrollbar relative z-10">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-base font-semibold whitespace-nowrap px-5 py-2.5 rounded-full liquid-glass ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-400'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <main className="flex flex-col items-center px-4 md:px-6 pt-4 md:pt-6 pb-20 max-w-6xl mx-auto relative z-10">
          <div className="h-20 md:h-24 mb-4 md:mb-6 flex items-center justify-center animate-fade-rise text-center w-full max-w-4xl">
            <TextType
              key={lang}
              text={t.hero_phrases}
              as="h1"
              typingSpeed={70}
              pauseDuration={2500}
              deletingSpeed={40}
              showCursor={true}
              cursorCharacter="|"
              className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-[-1px] font-display text-white pointer-events-none"
              cursorClassName="text-gray-500 font-extralight"
            />
          </div>

          <div className={`w-full liquid-glass rounded-3xl p-5 md:p-8 animate-fade-rise-delay text-base md:text-lg ${activeTab === 'wheel1' || activeTab === 'wheel2' ? '' : 'min-h-[500px]'}`}>
            {activeTab === 'attendance' && (
              <div className="flex flex-col gap-5">
                <p className={SECTION_LABEL_CLASS}>{t.attendance_title}</p>
                <p className="text-gray-300 text-base md:text-lg font-medium -mt-2">{t.attendance_desc}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl relative z-20">
                      <span className={`text-lg font-semibold ${s.present ? "text-white" : "text-gray-500 line-through"}`}>{s.name}</span>
                      <button onClick={() => toggleStudentPresence(s.id)} className={`glass-btn text-sm ${s.present ? '' : 'danger'}`}>{s.present ? t.present : t.absent}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'wheel1' && (
              <div className="flex flex-col items-center text-center gap-3 py-1">
                <div className={SECTION_LABEL_CLASS}>{t.wheel_students_left} {wheel1Students.length}</div>
                <WheelVisual size="single" items={wheel1Students.map(s => ({ id: s.id, label: s.name }))} rotation={rotation1} isSpinning={spinning1} emptyLabel={t.empty_wheel} />
                <div className="min-h-[2.5rem] flex items-center justify-center">
                  {resultStudent && !spinning1 && <span className="text-2xl md:text-3xl font-display font-semibold animate-fade-rise text-white">{resultStudent.name}</span>}
                </div>
                <button onClick={handleSpinLeft} disabled={spinning1 || wheel1Students.length === 0} className="glass-btn mt-2 relative z-20">{spinning1 ? t.spinning : t.spin_student}</button>
                {resultStudent && !spinning1 && (
                  <div className="flex flex-col sm:flex-row gap-3 animate-fade-rise mt-2 relative z-20">
                    <button onClick={() => { setWheel1Students(prev => prev.filter(s => s.id !== resultStudent.id)); setResultStudent(null); }} className="glass-btn danger">{t.remove_from_wheel}</button>
                    <button onClick={() => { setWheel1Students(students.filter(s => s.present)); setResultStudent(null); }} className="glass-btn">{t.reset_wheel}</button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'wheel2' && (
              <div className="flex flex-col items-center gap-5 py-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full justify-items-center">
                  <div className="flex flex-col items-center gap-3 w-full max-w-[17.5rem] sm:max-w-[18rem] md:max-w-[17.5rem] lg:max-w-full">
                    <span className={SECTION_LABEL_CLASS}>{t.wheel_students_left} {wheel2Students.length}</span>
                    <WheelVisual size="double" items={wheel2Students.map(s => ({ id: s.id, label: s.name }))} rotation={rotation1} isSpinning={spinning1} emptyLabel={t.empty_wheel} />
                    <div className="min-h-[2rem] text-center">
                      {resultStudent && !spinning1 && <span className="text-xl md:text-2xl font-semibold animate-fade-rise">{resultStudent.name}</span>}
                    </div>
                    {resultStudent && !spinning1 && (
                      <div className="flex flex-col sm:flex-row gap-2 animate-fade-rise relative z-20">
                        <button onClick={() => { setWheel2Students(prev => prev.filter(s => s.id !== resultStudent.id)); setResultStudent(null); }} className="glass-btn danger">{t.remove_from_wheel}</button>
                        <button onClick={() => { setWheel2Students(students.filter(s => s.present)); setResultStudent(null); }} className="glass-btn">{t.reset_wheel}</button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-3 w-full max-w-[17.5rem] sm:max-w-[18rem] md:max-w-[17.5rem] lg:max-w-full">
                    <span className={SECTION_LABEL_CLASS}>{t.topics_title} ({questions.length})</span>
                    <WheelVisual size="double" items={questions.map(q => ({ id: q.id, label: q.text }))} rotation={rotation2} isSpinning={spinning2} emptyLabel={t.empty_wheel} />
                    <div className="min-h-[2rem] text-center px-2">
                      {resultQuestion && !spinning2 && <span className="text-lg md:text-xl font-semibold animate-fade-rise">{resultQuestion.text}</span>}
                    </div>
                    {resultQuestion && !spinning2 && (
                      <button onClick={() => { setQuestions(prev => prev.filter(q => q.id !== resultQuestion.id)); setResultQuestion(null); }} className="glass-btn danger relative z-20">{t.remove_topic}</button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center w-full max-w-md gap-4 mt-1 border-t border-white/10 pt-6 relative z-20">
                  <button onClick={handleSpinBoth} disabled={spinning1 || spinning2 || wheel2Students.length === 0 || questions.length === 0} className="glass-btn w-full">{spinning1 || spinning2 ? t.spinning : t.spin_both}</button>
                  <form onSubmit={handleAddQuestion} className="w-full flex gap-2">
                    <input type="text" value={newQuestionStr} onChange={(e) => setNewQuestionStr(e.target.value)} placeholder={t.add_question_ph} className="bg-white/5 border border-white/20 rounded-xl text-white text-base font-medium px-4 py-3 w-full outline-none focus:border-white/60 transition-colors placeholder:text-slate-300" />
                    <button type="submit" className="glass-btn submit">{t.add}</button>
                  </form>
                </div>
              </div>
            )}
            {activeTab === 'groups' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row gap-6 items-end justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="flex flex-col gap-2 w-full md:w-1/3 relative z-20">
                    <label className="text-gray-300 text-base font-semibold">{t.groups_count}</label>
                    <input type="number" min="1" max={students.filter(s=>s.present).length} value={groupCount} onChange={(e) => setGroupCount(Number(e.target.value))} className="bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-semibold outline-none focus:border-white/60" />
                  </div>
                  <div className="flex flex-col gap-1 pb-3 text-base font-medium text-gray-300 w-full md:w-1/3 text-center">{t.active_students} <span className="text-white text-2xl font-display font-semibold">{students.filter(s=>s.present).length}</span></div>
                  <button onClick={generateGroups} className="glass-btn w-full md:w-1/3 relative z-20">{t.generate}</button>
                </div>
                {groups.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-rise">
                    {groups.map((group, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="font-display text-2xl font-semibold mb-4 text-gray-200">{t.group} {idx + 1} <span className="text-base font-body font-medium text-gray-400">({group.length} {t.people})</span></h3>
                        <ul className="space-y-2">{group.map(s => <li key={s.id} className="text-lg font-semibold text-white/90 border-b border-white/5 pb-2 last:border-0">{s.name}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ClickSpark>
  );
}