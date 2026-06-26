import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import TrueFocus from './components/ui/TrueFocus';
import TextType from './components/ui/TextType';
import ClickSpark from './components/ui/ClickSpark';

import './App.css';

type Language = 'en' | 'de';
type TabId = 'attendance' | 'wheel1' | 'wheel2' | 'groups';
type Student = { id: number; name: string; present: boolean; score: number };
type Topic = { id: string; text: string };

const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: 'Artem', present: true, score: 0 },
  { id: 2, name: 'Ivan', present: true, score: 0 },
  { id: 3, name: 'Roman', present: true, score: 0 },
  { id: 4, name: 'Andrii K', present: true, score: 0 },
  { id: 5, name: 'Vlad', present: true, score: 0 },
  { id: 6, name: 'Oleg', present: true, score: 0 },
  { id: 7, name: 'Denys', present: true, score: 0 },
  { id: 8, name: 'Marsel', present: true, score: 0 },
  { id: 9, name: 'Andrii R', present: true, score: 0 },
  { id: 10, name: 'Andrii P', present: true, score: 0 },
  { id: 11, name: 'Alexander', present: true, score: 0 },
  { id: 12, name: 'Vitalii', present: true, score: 0 },
  { id: 13, name: 'Ilarii', present: true, score: 0 },
  { id: 14, name: 'Nadya', present: true, score: 0 },
  { id: 15, name: 'Jasmina', present: true, score: 0 },
  { id: 16, name: 'Oleksii', present: true, score: 0 },
  { id: 17, name: 'Kostyantyn', present: true, score: 0 },
  { id: 18, name: 'Vladyslav', present: true, score: 0 },
];

const STORAGE_KEYS = {
  students: 'kurs-app-students',
  wheel1Students: 'kurs-app-wheel1-students',
  wheel2Students: 'kurs-app-wheel2-students',
  topics: 'kurs-app-topics',
} as const;

const dict = {
  en: {
    hero_phrases: ['Speak even if it is wrong.', 'Your future self will thank you.'],
    tab_attendance: 'Attendance',
    tab_wheel1: 'Single Wheel',
    tab_wheel2: 'Double Wheel',
    tab_groups: 'Groups',
    attendance_title: 'Class List',
    attendance_desc: "Mark absent students. Present students stay saved on this device.",
    present: 'Present',
    absent: 'Absent',
    wheel_students_left: 'Students in wheel:',
    spinning: 'Spinning...',
    click_to_spin: 'Click the wheel to spin',
    remove_from_wheel: 'Remove from wheel',
    reset_wheel: 'Reset wheel',
    add_question_ph: 'Type a topic or question...',
    add: 'Add',
    add_student_ph: 'New student name...',
    add_student: 'Add student',
    remove_topic: 'Remove topic',
    clear_topics: 'Clear topics',
    empty_wheel: 'Empty',
    groups_count: 'Number of groups',
    active_students: 'Total active students:',
    generate: 'Generate',
    group: 'Group',
    people: 'people',
    topics_title: 'Topics',
    score_title: 'Student score',
    score_prompt: 'Add points for the answer:',
    no_scores: 'No points yet',
    show_score: 'Show student score',
    hide_score: 'Hide score',
    clear_score: 'Clear all score',
    delete_student: 'Delete student',
    timer_minutes: 'Timer minutes',
    start_timer: 'Start timer',
    timer_done: 'Time is up. Groups were shuffled.',
  },
  de: {
    hero_phrases: ['Jeden Tag ein bisschen besser.', 'Uebung macht den Meister.'],
    tab_attendance: 'Anwesenheit',
    tab_wheel1: 'Ein Rad',
    tab_wheel2: 'Zwei Raeder',
    tab_groups: 'Gruppen',
    attendance_title: 'Klassenliste',
    attendance_desc: 'Abwesende Schueler markieren. Die Liste bleibt auf diesem Geraet gespeichert.',
    present: 'Anwesend',
    absent: 'Abwesend',
    wheel_students_left: 'Schueler im Rad:',
    spinning: 'Dreht sich...',
    click_to_spin: 'Zum Drehen auf das Rad klicken',
    remove_from_wheel: 'Aus dem Rad entfernen',
    reset_wheel: 'Rad zuruecksetzen',
    add_question_ph: 'Thema oder Frage eingeben...',
    add: 'Hinzufuegen',
    add_student_ph: 'Neuer Schuelername...',
    add_student: 'Schueler hinzufuegen',
    remove_topic: 'Thema entfernen',
    clear_topics: 'Themen leeren',
    empty_wheel: 'Leer',
    groups_count: 'Anzahl der Gruppen',
    active_students: 'Aktive Schueler gesamt:',
    generate: 'Generieren',
    group: 'Gruppe',
    people: 'Personen',
    topics_title: 'Themen',
    score_title: 'Punkte',
    score_prompt: 'Punkte fuer die Antwort:',
    no_scores: 'Noch keine Punkte',
    show_score: 'Punkte anzeigen',
    hide_score: 'Punkte ausblenden',
    clear_score: 'Alle Punkte loeschen',
    delete_student: 'Schueler loeschen',
    timer_minutes: 'Timer Minuten',
    start_timer: 'Timer starten',
    timer_done: 'Zeit ist um. Gruppen wurden neu gemischt.',
  }
};

const readStoredValue = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
};

const normalizeStudents = (students: Student[]) =>
  students.map(student => ({ ...student, score: Number(student.score) || 0 }));

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const SECTION_LABEL_CLASS = 'text-gray-100 text-xl md:text-2xl font-bold font-body';

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
  onSpin,
  disabled = false,
}: {
  items: { id: string | number; label: string }[];
  rotation: number;
  isSpinning: boolean;
  emptyLabel?: string;
  size?: keyof typeof WHEEL_SIZES;
  onSpin?: () => void;
  disabled?: boolean;
}) => {
  const sizeClass = WHEEL_SIZES[size];
  const canClick = Boolean(onSpin) && !disabled;

  if (items.length === 0) {
    return (
      <button
        type="button"
        onClick={canClick ? onSpin : undefined}
        disabled={!canClick}
        className={'relative ' + sizeClass + ' max-w-full mx-auto rounded-full cursor-default'}
      >
        <div className="w-full h-full rounded-full border border-white/20 bg-black/30 flex items-center justify-center">
          <span className="text-slate-300 text-2xl font-semibold">{emptyLabel}</span>
        </div>
      </button>
    );
  }

  const step = 360 / items.length;
  const colors = [
    'rgba(255, 59, 59, 0.75)',
    'rgba(52, 211, 153, 0.75)',
    'rgba(251, 146, 60, 0.75)',
    'rgba(96, 165, 250, 0.75)',
    'rgba(196, 121, 255, 0.75)',
    'rgba(250, 204, 21, 0.75)',
    'rgba(20, 184, 166, 0.75)',
  ];

  const gradientStr = items.map((_, i) => {
    const color = colors[i % colors.length];
    return color + ' ' + (i * step) + 'deg ' + ((i + 1) * step) + 'deg';
  }).join(', ');

  const fontSizeClass = size === 'single' ? 'text-base md:text-lg' : 'text-sm md:text-base lg:text-lg';

  return (
    <button
      type="button"
      onClick={canClick ? onSpin : undefined}
      disabled={!canClick}
      aria-label="Spin wheel"
      className={'relative ' + sizeClass + ' max-w-full mx-auto rounded-full group ' + (canClick ? 'cursor-pointer' : 'cursor-default')}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 text-white drop-shadow-md pointer-events-none">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="md:w-10 md:h-10">
          <path d="M12 2L20 12H4L12 2Z" />
        </svg>
      </div>
      <div
        className="w-full h-full rounded-full border-2 border-white/25 overflow-hidden relative transition-shadow group-hover:shadow-[0_0_34px_rgba(255,255,255,0.22)]"
        style={{
          background: 'conic-gradient(' + gradientStr + ')',
          transform: 'rotate(' + rotation + 'deg)',
          transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'box-shadow 0.2s ease',
        }}
      >
        {items.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" style={{ zIndex: 5 }}>
            {items.map((_, i) => {
              const angle = i * step;
              const radians = ((angle - 90) * Math.PI) / 180;
              const x2 = 50 + 50 * Math.cos(radians);
              const y2 = 50 + 50 * Math.sin(radians);
              return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />;
            })}
          </svg>
        )}

        {items.map((item, i) => {
          const angle = (i * step) + (step / 2);
          return (
            <div key={item.id} className="absolute inset-0 pointer-events-none" style={{ transform: 'rotate(' + angle + 'deg)' }}>
              <div className="absolute left-1/2 -translate-x-1/2 overflow-hidden flex items-end justify-center pb-5 md:pb-8" style={{ top: '4%', height: '38%' }}>
                <span
                  className={'text-white ' + fontSizeClass + ' font-semibold tracking-wide drop-shadow-md inline-block'}
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
                  {item.label.trim()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-[#071017] border-2 border-white/25 rounded-full z-10 shadow-inner pointer-events-none" />
    </button>
  );
};

const ScoreBoard = ({ students, title, emptyLabel }: { students: Student[]; title: string; emptyLabel: string }) => {
  const sortedStudents = [...students].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const hasScores = sortedStudents.some(student => student.score !== 0);

  return (
    <div className="w-full max-w-xl mx-auto bg-black/25 border border-white/10 rounded-2xl p-4 md:p-5 text-left">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg md:text-xl font-bold text-white">{title}</h3>
        {!hasScores && <span className="text-sm text-slate-300">{emptyLabel}</span>}
      </div>
      <div className="max-h-64 overflow-auto pr-1 space-y-2">
        {sortedStudents.map(student => (
          <div key={student.id} className="grid grid-cols-[1fr_auto] gap-4 items-center rounded-xl bg-white/5 border border-white/10 px-4 py-2.5">
            <span className={'font-semibold ' + (student.present ? 'text-white' : 'text-slate-400')}>{student.name}</span>
            <span className="font-bold text-white tabular-nums">{student.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(restSeconds).padStart(2, '0');
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = dict[lang];

  const [activeTab, setActiveTab] = useState<TabId>('wheel2');
  const [students, setStudents] = useState<Student[]>(() => normalizeStudents(readStoredValue(STORAGE_KEYS.students, INITIAL_STUDENTS)));
  const [wheel1Students, setWheel1Students] = useState<Student[]>(() => normalizeStudents(readStoredValue(STORAGE_KEYS.wheel1Students, readStoredValue(STORAGE_KEYS.students, INITIAL_STUDENTS).filter(student => student.present))));
  const [wheel2Students, setWheel2Students] = useState<Student[]>(() => normalizeStudents(readStoredValue(STORAGE_KEYS.wheel2Students, readStoredValue(STORAGE_KEYS.students, INITIAL_STUDENTS).filter(student => student.present))));
  const [questions, setQuestions] = useState<Topic[]>(() => readStoredValue(STORAGE_KEYS.topics, [] as Topic[]));
  const [newQuestionStr, setNewQuestionStr] = useState('');
  const [newStudentName, setNewStudentName] = useState('');

  const [spinning1, setSpinning1] = useState(false);
  const [rotation1, setRotation1] = useState(0);
  const [resultStudent, setResultStudent] = useState<Student | null>(null);
  const [resultSource, setResultSource] = useState<'wheel1' | 'wheel2' | null>(null);
  const [resultScored, setResultScored] = useState(false);

  const [spinning2, setSpinning2] = useState(false);
  const [rotation2, setRotation2] = useState(0);
  const [resultQuestion, setResultQuestion] = useState<Topic | null>(null);

  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState<Student[][]>([]);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(5 * 60);
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'ready'>('idle');
  const [lastGeneratedGroupKey, setLastGeneratedGroupKey] = useState('');
  const [showScoreBoard, setShowScoreBoard] = useState(false);

  const spinSoundRef = useRef<HTMLAudioElement>(new Audio(import.meta.env.BASE_URL + 'spin.mp3'));
  const presentStudentKey = students.filter(student => student.present).map(student => student.id).join(',');
  const currentGroupSetupKey = presentStudentKey + '|' + groupCount + '|' + timerMinutes;
  const groupsNeedGenerate = groups.length === 0 || lastGeneratedGroupKey !== currentGroupSetupKey;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.wheel1Students, JSON.stringify(wheel1Students));
  }, [wheel1Students]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.wheel2Students, JSON.stringify(wheel2Students));
  }, [wheel2Students]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.topics, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    if (groupsNeedGenerate && timerStatus !== 'idle') {
      setTimerStatus('idle');
      setTimerSecondsLeft(timerMinutes * 60);
    }
  }, [groupsNeedGenerate, timerMinutes, timerStatus]);

  useEffect(() => {
    if (timerStatus !== 'running') return;

    const intervalId = window.setInterval(() => {
      setTimerSecondsLeft(prevSeconds => Math.max(0, prevSeconds - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerStatus]);

  useEffect(() => {
    if (timerStatus !== 'running' || timerSecondsLeft !== 0) return;

    const present = students.filter(student => student.present);
    if (present.length > 0 && groupCount > 0) {
      const shuffled = shuffleArray(present);
      const newGroups = Array.from({ length: groupCount }, () => [] as Student[]);
      shuffled.forEach((student, index) => { newGroups[index % groupCount].push(student); });
      setGroups(newGroups);
      setLastGeneratedGroupKey(currentGroupSetupKey);
    }
    setTimerStatus('ready');
    setTimerSecondsLeft(timerMinutes * 60);
  }, [currentGroupSetupKey, groupCount, students, timerMinutes, timerSecondsLeft, timerStatus]);

  const toggleStudentPresence = (id: number) => {
    setStudents(prevStudents => {
      const target = prevStudents.find(student => student.id === id);
      if (!target) return prevStudents;

      const updatedStudent = { ...target, present: !target.present };
      if (updatedStudent.present) {
        setWheel1Students(prevWheel => prevWheel.some(student => student.id === id) ? prevWheel : [...prevWheel, updatedStudent]);
        setWheel2Students(prevWheel => prevWheel.some(student => student.id === id) ? prevWheel : [...prevWheel, updatedStudent]);
      } else {
        setWheel1Students(prevWheel => prevWheel.filter(student => student.id !== id));
        setWheel2Students(prevWheel => prevWheel.filter(student => student.id !== id));
      }

      return prevStudents.map(student => student.id === id ? updatedStudent : student);
    });
  };

  const updateStudentName = (id: number, name: string) => {
    const updateName = (student: Student) => student.id === id ? { ...student, name } : student;
    setStudents(prevStudents => prevStudents.map(updateName));
    setWheel1Students(prevWheel => prevWheel.map(updateName));
    setWheel2Students(prevWheel => prevWheel.map(updateName));
    setResultStudent(prev => prev?.id === id ? { ...prev, name } : prev);
  };

  const deleteStudent = (id: number) => {
    setStudents(prevStudents => prevStudents.filter(student => student.id !== id));
    setWheel1Students(prevWheel => prevWheel.filter(student => student.id !== id));
    setWheel2Students(prevWheel => prevWheel.filter(student => student.id !== id));
    setResultStudent(prev => prev?.id === id ? null : prev);
    setGroups(prevGroups => prevGroups.map(group => group.filter(student => student.id !== id)));
  };

  const addStudent = (e: FormEvent) => {
    e.preventDefault();
    const name = newStudentName.trim();
    if (!name) return;

    const newStudent: Student = {
      id: Math.max(0, ...students.map(student => student.id)) + 1,
      name,
      present: true,
      score: 0,
    };

    setStudents(prevStudents => [...prevStudents, newStudent]);
    setWheel1Students(prevWheel => [...prevWheel, newStudent]);
    setWheel2Students(prevWheel => [...prevWheel, newStudent]);
    setNewStudentName('');
  };

  const playSpinSound = () => {
    if (!spinSoundRef.current) return;
    spinSoundRef.current.currentTime = 0;
    spinSoundRef.current.play().catch(error => console.log('Sound play blocked', error));
  };

  const stopSpinSound = () => {
    if (spinSoundRef.current) spinSoundRef.current.pause();
  };

  const rotateToWinner = (winnerIndex: number, itemCount: number, extraTurns: number, setRotation: Dispatch<SetStateAction<number>>) => {
    const sliceAngle = 360 / itemCount;
    const targetAngle = 360 - ((winnerIndex * sliceAngle) + (sliceAngle / 2));
    setRotation(prev => {
      const currentMod = prev % 360;
      let diff = targetAngle - currentMod;
      if (diff < 0) diff += 360;
      return prev + (360 * extraTurns) + diff;
    });
  };

  const handleSpinLeft = () => {
    if (wheel1Students.length === 0 || spinning1) return;
    setSpinning1(true);
    setResultStudent(null);
    setResultQuestion(null);
    setResultScored(false);
    setResultSource('wheel1');
    playSpinSound();

    const winnerIndex = Math.floor(Math.random() * wheel1Students.length);
    rotateToWinner(winnerIndex, wheel1Students.length, 5, setRotation1);

    setTimeout(() => {
      setResultStudent(wheel1Students[winnerIndex]);
      setResultSource('wheel1');
      setSpinning1(false);
      stopSpinSound();
    }, 4000);
  };

  const handleSpinBoth = () => {
    if (wheel2Students.length === 0 || questions.length === 0 || spinning1 || spinning2) return;
    playSpinSound();

    setSpinning1(true);
    setSpinning2(true);
    setResultStudent(null);
    setResultQuestion(null);
    setResultScored(false);
    setResultSource('wheel2');

    const winnerIndex1 = Math.floor(Math.random() * wheel2Students.length);
    const winnerIndex2 = Math.floor(Math.random() * questions.length);
    rotateToWinner(winnerIndex1, wheel2Students.length, 5, setRotation1);
    rotateToWinner(winnerIndex2, questions.length, 6, setRotation2);

    setTimeout(() => {
      setResultStudent(wheel2Students[winnerIndex1]);
      setResultQuestion(questions[winnerIndex2]);
      setResultSource('wheel2');
      setSpinning1(false);
      setSpinning2(false);
      stopSpinSound();
    }, 4000);
  };

  const addPointsToResult = (points: number) => {
    if (!resultStudent || resultScored) return;

    const updateScore = (student: Student) => student.id === resultStudent.id ? { ...student, score: student.score + points } : student;
    setStudents(prevStudents => prevStudents.map(updateScore));
    setWheel1Students(prevWheel => prevWheel.map(updateScore));
    setWheel2Students(prevWheel => prevWheel.map(updateScore));
    setResultStudent(prev => prev ? { ...prev, score: prev.score + points } : prev);
    setResultScored(true);
  };

  const clearAllScores = () => {
    const resetScore = (student: Student) => ({ ...student, score: 0 });
    setStudents(prevStudents => prevStudents.map(resetScore));
    setWheel1Students(prevWheel => prevWheel.map(resetScore));
    setWheel2Students(prevWheel => prevWheel.map(resetScore));
    setGroups(prevGroups => prevGroups.map(group => group.map(resetScore)));
    setResultStudent(prev => prev ? { ...prev, score: 0 } : prev);
  };

  const removeResultFromWheel = () => {
    if (!resultStudent) return;

    if (resultSource === 'wheel2') {
      setWheel2Students(prev => prev.filter(student => student.id !== resultStudent.id));
    } else {
      setWheel1Students(prev => prev.filter(student => student.id !== resultStudent.id));
    }
    setResultStudent(null);
  };

  const resetActiveWheel = () => {
    const presentStudents = students.filter(student => student.present);
    if (activeTab === 'wheel2') {
      setWheel2Students(presentStudents);
    } else {
      setWheel1Students(presentStudents);
    }
    setResultStudent(null);
  };

  const generateGroups = () => {
    const present = students.filter(student => student.present);
    if (present.length === 0 || groupCount < 1) return;
    const shuffled = shuffleArray(present);
    const newGroups = Array.from({ length: groupCount }, () => [] as Student[]);
    shuffled.forEach((student, index) => { newGroups[index % groupCount].push(student); });
    setGroups(newGroups);
    setLastGeneratedGroupKey(currentGroupSetupKey);
    setTimerSecondsLeft(timerMinutes * 60);
    setTimerStatus('running');
  };

  const startTimer = () => {
    if (groupsNeedGenerate || groups.length === 0) {
      generateGroups();
      return;
    }

    setTimerSecondsLeft(timerMinutes * 60);
    setTimerStatus('running');
  };

  const handleAddQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!newQuestionStr.trim()) return;
    setQuestions([...questions, { id: Date.now().toString(), text: newQuestionStr.trim() }]);
    setNewQuestionStr('');
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'attendance', label: t.tab_attendance },
    { id: 'wheel1', label: t.tab_wheel1 },
    { id: 'wheel2', label: t.tab_wheel2 },
    { id: 'groups', label: t.tab_groups },
  ];

  const resultControls = resultStudent && !spinning1 && (
    <div className="flex flex-col items-center gap-3 animate-fade-rise relative z-20">
      {!resultScored && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm md:text-base text-slate-200 font-semibold mr-1">{t.score_prompt}</span>
          {[-1, 0, 1, 2].map(points => (
            <button key={points} onClick={() => addPointsToResult(points)} className="score-btn" type="button">
              {points > 0 ? '+' + points : points}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={removeResultFromWheel} className="glass-btn danger" type="button">{t.remove_from_wheel}</button>
        <button onClick={resetActiveWheel} className="glass-btn" type="button">{t.reset_wheel}</button>
      </div>
    </div>
  );

  const scoreModal = showScoreBoard && (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-[#071017]/95 p-5 md:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-body font-semibold text-white">{t.score_title}</h2>
          <div className="flex gap-2">
            <button onClick={clearAllScores} className="glass-btn danger text-sm" type="button">{t.clear_score}</button>
            <button onClick={() => setShowScoreBoard(false)} className="glass-btn text-sm" type="button">{t.hide_score}</button>
          </div>
        </div>
        <ScoreBoard students={students} title={t.score_title} emptyLabel={t.no_scores} />
      </div>
    </div>
  );

  return (
    <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
      <div className="relative min-h-screen font-body text-white selection:bg-white/20 overflow-x-hidden">
        {scoreModal}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <video autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" />
        </div>
        <nav className="relative z-10 flex justify-between items-center px-6 md:px-8 py-6 w-full max-w-[1400px] mx-auto">
          <div className="text-3xl md:text-4xl tracking-tight h-10 flex items-center">
            <TrueFocus sentence="busiest man" manualMode={false} blurAmount={3} borderColor="#fff" glowColor="rgba(255, 255, 255, 0.6)" animationDuration={0.5} pauseBetweenAnimations={6} />
          </div>

          <div className="hidden md:flex space-x-8 text-base md:text-lg font-semibold text-gray-300">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={'hover:text-white transition-colors ' + (activeTab === tab.id ? 'text-white border-b-2 border-white pb-1' : '')} type="button">
                {tab.label}
              </button>
            ))}
          </div>
          <div className="liquid-glass rounded-full flex text-xs font-medium cursor-pointer relative z-20">
            <button onClick={() => setLang('en')} className={'px-4 py-2 rounded-full transition-colors ' + (lang === 'en' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white')} type="button">EN</button>
            <button onClick={() => setLang('de')} className={'px-4 py-2 rounded-full transition-colors ' + (lang === 'de' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white')} type="button">DE</button>
          </div>
        </nav>
        <div className="md:hidden flex overflow-x-auto px-6 gap-4 pb-4 no-scrollbar relative z-10">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={'text-base font-semibold whitespace-nowrap px-5 py-2.5 rounded-full liquid-glass ' + (activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-400')} type="button">
              {tab.label}
            </button>
          ))}
        </div>
        <main className="flex flex-col items-center px-4 md:px-6 pt-4 md:pt-6 pb-20 w-full max-w-[1400px] mx-auto relative z-10">
          <div className="h-20 md:h-24 mb-4 md:mb-6 flex items-center justify-center animate-fade-rise text-center w-full max-w-[1100px]">
            <TextType
              key={lang}
              text={t.hero_phrases}
              as="h1"
              typingSpeed={70}
              pauseDuration={2500}
              deletingSpeed={40}
              showCursor={true}
              cursorCharacter="|"
              className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-normal font-body font-semibold text-white pointer-events-none"
              cursorClassName="text-gray-500 font-extralight"
            />
          </div>

          <div className={'w-full liquid-glass app-panel rounded-3xl p-5 md:p-8 animate-fade-rise-delay text-base md:text-lg shadow-[0_24px_90px_rgba(0,0,0,0.65)] ' + (activeTab === 'wheel1' || activeTab === 'wheel2' ? '' : 'min-h-[500px]')}>
            {activeTab === 'attendance' && (
              <div className="flex flex-col gap-5">
                <p className={SECTION_LABEL_CLASS}>{t.attendance_title}</p>
                <p className="text-gray-200 text-base md:text-lg font-medium -mt-2">{t.attendance_desc}</p>
                <form onSubmit={addStudent} className="flex flex-col sm:flex-row gap-3 relative z-20">
                  <input type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder={t.add_student_ph} className="bg-black/25 border border-white/20 rounded-xl text-white text-base font-medium px-4 py-3 w-full outline-none focus:border-white/60 transition-colors placeholder:text-slate-300" />
                  <button type="submit" className="glass-btn submit shrink-0">{t.add_student}</button>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center gap-3 bg-black/25 border border-white/10 p-4 rounded-xl relative z-20">
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => updateStudentName(student.id, e.target.value)}
                        className={'min-w-0 w-full bg-transparent border-b border-white/10 px-1 py-1 text-lg font-semibold outline-none focus:border-white/60 ' + (student.present ? 'text-white' : 'text-gray-500 line-through')}
                      />
                      <button onClick={() => toggleStudentPresence(student.id)} className={'glass-btn text-sm shrink-0 ' + (student.present ? '' : 'danger')} type="button">
                        {student.present ? t.present : t.absent}
                      </button>
                      <button onClick={() => deleteStudent(student.id)} className="icon-btn danger shrink-0" type="button" aria-label={t.delete_student} title={t.delete_student}>
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                          <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wheel1' && (
              <div className="flex flex-col items-center text-center gap-4 py-1">
                <div className={SECTION_LABEL_CLASS}>{t.wheel_students_left} {wheel1Students.length}</div>
                <WheelVisual size="single" items={wheel1Students.map(student => ({ id: student.id, label: student.name }))} rotation={rotation1} isSpinning={spinning1} emptyLabel={t.empty_wheel} onSpin={handleSpinLeft} disabled={spinning1 || wheel1Students.length === 0} />
                <p className="text-sm text-slate-300 -mt-1">{spinning1 ? t.spinning : t.click_to_spin}</p>
                <div className="min-h-[2.5rem] flex items-center justify-center">
                  {resultStudent && !spinning1 && <span className="text-2xl md:text-3xl font-body font-semibold animate-fade-rise text-white">{resultStudent.name}</span>}
                </div>
                {resultControls}
                <button onClick={() => setShowScoreBoard(true)} className="glass-btn relative z-20" type="button">{t.show_score}</button>
              </div>
            )}

            {activeTab === 'wheel2' && (
              <div className="flex flex-col items-center gap-5 py-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full justify-items-center">
                  <div className="flex flex-col items-center gap-3 w-full max-w-[17.5rem] sm:max-w-[18rem] md:max-w-[17.5rem] lg:max-w-full">
                    <span className={SECTION_LABEL_CLASS}>{t.wheel_students_left} {wheel2Students.length}</span>
                    <WheelVisual size="double" items={wheel2Students.map(student => ({ id: student.id, label: student.name }))} rotation={rotation1} isSpinning={spinning1} emptyLabel={t.empty_wheel} onSpin={handleSpinBoth} disabled={spinning1 || spinning2 || wheel2Students.length === 0 || questions.length === 0} />
                    <div className="min-h-[2rem] text-center">
                      {resultStudent && !spinning1 && <span className="text-xl md:text-2xl font-semibold animate-fade-rise">{resultStudent.name}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 w-full max-w-[17.5rem] sm:max-w-[18rem] md:max-w-[17.5rem] lg:max-w-full">
                    <span className={SECTION_LABEL_CLASS}>{t.topics_title} ({questions.length})</span>
                    <WheelVisual size="double" items={questions.map(question => ({ id: question.id, label: question.text }))} rotation={rotation2} isSpinning={spinning2} emptyLabel={t.empty_wheel} onSpin={handleSpinBoth} disabled={spinning1 || spinning2 || wheel2Students.length === 0 || questions.length === 0} />
                    <div className="min-h-[2rem] text-center px-2">
                      {resultQuestion && !spinning2 && <span className="text-lg md:text-xl font-semibold animate-fade-rise">{resultQuestion.text}</span>}
                    </div>
                    {resultQuestion && !spinning2 && (
                      <button onClick={() => { setQuestions(prev => prev.filter(question => question.id !== resultQuestion.id)); setResultQuestion(null); }} className="glass-btn danger relative z-20" type="button">{t.remove_topic}</button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-300 -mt-2">{spinning1 || spinning2 ? t.spinning : t.click_to_spin}</p>
                {resultControls}
                <div className="flex flex-col items-center w-full max-w-md gap-4 mt-1 border-t border-white/10 pt-6 relative z-20">
                  <form onSubmit={handleAddQuestion} className="w-full flex gap-2">
                    <input type="text" value={newQuestionStr} onChange={(e) => setNewQuestionStr(e.target.value)} placeholder={t.add_question_ph} className="bg-black/25 border border-white/20 rounded-xl text-white text-base font-medium px-4 py-3 w-full outline-none focus:border-white/60 transition-colors placeholder:text-slate-300" />
                    <button type="submit" className="glass-btn submit">{t.add}</button>
                  </form>
                  <button onClick={() => { setQuestions([]); setResultQuestion(null); }} disabled={questions.length === 0} className="glass-btn danger w-full" type="button">{t.clear_topics}</button>
                </div>
                <button onClick={() => setShowScoreBoard(true)} className="glass-btn relative z-20" type="button">{t.show_score}</button>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr] gap-5 items-end bg-black/25 p-5 md:p-6 rounded-2xl border border-white/10">
                  <div className="flex flex-col gap-2 relative z-20">
                    <label className="text-gray-200 text-base font-semibold">{t.groups_count}</label>
                    <input type="number" min="1" max={students.filter(student => student.present).length} value={groupCount} onChange={(e) => setGroupCount(Number(e.target.value))} className="bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-semibold outline-none focus:border-white/60" />
                  </div>
                  <div className="flex flex-col gap-2 relative z-20">
                    <label className="text-gray-200 text-base font-semibold">{t.timer_minutes}</label>
                    <input type="number" min="1" max="120" value={timerMinutes} onChange={(e) => setTimerMinutes(Math.max(1, Number(e.target.value) || 1))} className="bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-semibold outline-none focus:border-white/60" />
                  </div>
                  <div className="flex flex-col gap-1 text-base font-medium text-gray-200 text-center">
                    {t.active_students}
                    <span className="text-white text-2xl font-body font-semibold">{students.filter(student => student.present).length}</span>
                  </div>
                  <div className="flex flex-col gap-3 relative z-20">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                      <div className="font-body text-3xl font-semibold text-white tabular-nums">{formatTimer(timerSecondsLeft)}</div>
                      {timerStatus === 'ready' && <div className="text-xs font-semibold text-slate-300">{t.timer_done}</div>}
                    </div>
                    <button onClick={groupsNeedGenerate ? generateGroups : startTimer} disabled={timerStatus === 'running' || students.filter(student => student.present).length === 0} className="glass-btn w-full" type="button">
                      {groupsNeedGenerate ? t.generate : t.start_timer}
                    </button>
                  </div>
                </div>
                {groups.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-fade-rise">
                    {groups.map((group, idx) => (
                      <div key={idx} className="bg-black/25 border border-white/10 rounded-xl p-4">
                        <h3 className="font-body text-xl md:text-2xl font-semibold mb-3 text-gray-100">{t.group} {idx + 1} <span className="text-sm md:text-base font-body font-medium text-gray-300">({group.length} {t.people})</span></h3>
                        <ul className="space-y-1.5">{group.map(student => <li key={student.id} className="text-base md:text-lg font-semibold text-white/90 border-b border-white/5 pb-1.5 last:border-0">{student.name}</li>)}</ul>
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
