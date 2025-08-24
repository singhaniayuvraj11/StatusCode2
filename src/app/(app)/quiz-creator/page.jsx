'use client';

import { useState } from 'react';
import { createQuiz } from '@/ai/flows/create-quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, CheckCircle, XCircle, Trophy, FileUp, FileText } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function QuizDisplay({ quiz, onCheckAnswers }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (index, answer) => {
    setAnswers({ ...answers, [index]: answer });
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    onCheckAnswers();
  };

  const getResultColor = (i, option) => {
    if (!submitted) return '';
    const q = quiz[i];
    const isCorrect = q.answer === option;
    const isSelected = answers[i] === option;
    if (isCorrect) return 'text-green-500';
    if (isSelected && !isCorrect) return 'text-red-500';
    return '';
  };

  const getResultIcon = (i, option) => {
    if (!submitted) return null;
    const q = quiz[i];
    const isCorrect = q.answer === option;
    const isSelected = answers[i] === option;
    if (isCorrect) return <CheckCircle className="h-4 w-4 text-green-500 ml-2" />;
    if (isSelected && !isCorrect) return <XCircle className="h-4 w-4 text-red-500 ml-2" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {submitted && (
        <Card className="bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center gap-4">
            <Trophy className="h-10 w-10 text-yellow-500" />
            <div>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>
                You scored {score} out of {quiz.length}!
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={(score / quiz.length) * 100} className="w-full" />
          </CardContent>
        </Card>
      )}
      {quiz.map((q, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-lg">Question {i + 1}</CardTitle>
            <CardDescription className="text-base pt-2">{q.question}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[i] || ''}
              onValueChange={(val) => handleAnswerChange(i, val)}
              disabled={submitted}
            >
              {q.options.map((opt, j) => (
                <div
                  key={j}
                  className={`flex items-center space-x-2 p-2 rounded-md ${getResultColor(i, opt)}`}
                >
                  <RadioGroupItem value={opt} id={`q${i}-o${j}`} />
                  <Label htmlFor={`q${i}-o${j}`} className="flex-1 cursor-pointer">
                    {opt}
                  </Label>
                  {getResultIcon(i, opt)}
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
      {!submitted && (
        <Button onClick={handleSubmit} className="w-full">
          Check Answers
        </Button>
      )}
    </div>
  );
}

export default function QuizCreatorPage() {
  const [studyMaterials, setStudyMaterials] = useState('');
  const [questionTypes, setQuestionTypes] = useState('multiple-choice');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [documentFile, setDocumentFile] = useState(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);

  const handleFileChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.type !== 'application/pdf') {
      toast({ title: 'Invalid File Type', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }

    setDocumentFile(file);
    setIsParsingPdf(true);
    setStudyMaterials('');
    setQuiz(null);

    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(buf).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        text += tc.items.map((item) => item.str).join(' ') + '\n\n';
      }
      setStudyMaterials(text);
      toast({ title: 'Success', description: `Extracted text from ${file.name}.` });
    } catch (err) {
      console.error('PDF parse error:', err);
      toast({ title: 'Error', description: 'Failed to parse PDF.', variant: 'destructive' });
      setDocumentFile(null);
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setIsLoading(true);
    setQuiz(null);

    if (!studyMaterials.trim()) {
      const description =
        type === 'text'
          ? 'Please enter some text to generate a quiz.'
          : 'Could not extract text from the document.';
      toast({ title: 'Error', description, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      const result = await createQuiz({
        studyMaterials,
        questionTypes,
        difficultyLevel,
        numberOfQuestions: parseInt(numberOfQuestions, 10),
      });
      setQuiz(result.quiz);
    } catch (err) {
      console.error('Quiz error:', err);
      toast({ title: 'Error', description: 'Failed to create quiz.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const allDisabled = isLoading || isParsingPdf;

  return (
    <div className="p-4 md:p-8 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">AI Quiz Creator</h1>
        <p className="text-muted-foreground">Generate a quiz from text or PDF.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Text</TabsTrigger>
              <TabsTrigger value="document"><FileUp className="mr-2 h-4 w-4" /> PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle>From Text</CardTitle>
                  <CardDescription>Paste your study materials.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'text')} className="space-y-4">
                    <Textarea
                      placeholder="Paste text..."
                      className="min-h-[250px]"
                      value={studyMaterials}
                      onChange={(e) => setStudyMaterials(e.target.value)}
                      disabled={allDisabled}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select value={difficultyLevel} onValueChange={setDifficultyLevel} disabled={allDisabled}>
                        <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={questionTypes} onValueChange={setQuestionTypes} disabled={allDisabled}>
                        <SelectTrigger><SelectValue placeholder="Question type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true/false">True/False</SelectItem>
                          <SelectItem value="mixed">Mixed (MCQ + True/False)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions} disabled={allDisabled}>
                        <SelectTrigger><SelectValue placeholder="Number" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={allDisabled || !studyMaterials.trim()} className="w-full">
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Create Quiz</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="document">
              <Card>
                <CardHeader>
                  <CardTitle>From PDF</CardTitle>
                  <CardDescription>Upload PDF to extract text.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'document')} className="space-y-4">
                    <div className="space-y-2 pt-8 pb-8 text-center">
                      <Label htmlFor="pdf-file">Upload PDF</Label>
                      <Input id="pdf-file" type="file" onChange={handleFileChange} disabled={allDisabled} accept=".pdf" className="w-fit mx-auto" />
                      {documentFile && <p className="text-sm text-muted-foreground">Selected: {documentFile.name}</p>}
                      {isParsingPdf && <p className="text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Extracting text...</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select value={difficultyLevel} onValueChange={setDifficultyLevel} disabled={allDisabled}>
                        <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={questionTypes} onValueChange={setQuestionTypes} disabled={allDisabled}>
                        <SelectTrigger><SelectValue placeholder="Question type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true/false">True/False</SelectItem>
                          <SelectItem value="mixed">Mixed (MCQ + True/False)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions} disabled={allDisabled}>
                        <SelectTrigger><SelectValue placeholder="Number" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={allDisabled || !documentFile} className="w-full">
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FileUp className="mr-2 h-4 w-4" /> Upload & Create Quiz</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="h-full">
          <Card className="min-h-[570px]">
            <CardHeader>
              <CardTitle>Generated Quiz</CardTitle>
              <CardDescription>Your quiz will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col gap-4 pt-4">
                  <div className="h-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-24 bg-muted rounded animate-pulse"></div>
                </div>
              ) : quiz ? (
                <QuizDisplay quiz={quiz} onCheckAnswers={() => console.log('Checked answers')} />
              ) : (
                <div className="flex items-center justify-center h-[420px] text-muted-foreground">
                  <p>Your quiz will be generated here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
