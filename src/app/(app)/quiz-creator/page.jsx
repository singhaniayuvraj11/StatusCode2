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

// --- NEW: Imports to match the reference UI ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// --- NEW: Import pdfjs-dist library ---
import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;


function QuizDisplay({ quiz, onCheckAnswers }) {
  // This component remains unchanged.
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) correctCount++;
    });
    setScore(correctCount);
    setSubmitted(true);
    onCheckAnswers();
  };
  
  const getResultColor = (index, option) => {
    if (!submitted) return "";
    const question = quiz[index];
    const isCorrect = question.answer === option;
    const isSelected = answers[index] === option;
    if (isCorrect) return "text-green-500";
    if (isSelected && !isCorrect) return "text-red-500";
    return "";
  };
  
  const getResultIcon = (index, option) => {
    if (!submitted) return null;
    const question = quiz[index];
    const isCorrect = question.answer === option;
    const isSelected = answers[index] === option;
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
              <CardDescription>You scored {score} out of {quiz.length}!</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={(score / quiz.length) * 100} className="w-full" />
          </CardContent>
        </Card>
      )}
      {quiz.map((q, index) => (
        <Card key={index} className={submitted ? "border-muted" : ""}>
          <CardHeader>
            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
            <CardDescription className="text-base pt-2">{q.question}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={answers[index] || ''} onValueChange={(value) => handleAnswerChange(index, value)} disabled={submitted}>
              {q.options.map((option, optionIndex) => (
                <div key={optionIndex} className={`flex items-center space-x-2 p-2 rounded-md ${getResultColor(index, option)}`}>
                  <RadioGroupItem value={option} id={`q${index}-o${optionIndex}`} />
                  <Label htmlFor={`q${index}-o${optionIndex}`} className="flex-1 cursor-pointer">{option}</Label>
                  {getResultIcon(index, option)}
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
      {!submitted && <Button onClick={handleSubmit} className="w-full">Check Answers</Button>}
    </div>
  );
}


export default function QuizCreatorPage() {
  const [studyMaterials, setStudyMaterials] = useState('');
  const [questionTypes, setQuestionTypes] = useState('multiple-choice, true/false');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // --- MODIFIED: State to be consistent with reference ---
  const [documentFile, setDocumentFile] = useState(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);

  // --- MODIFIED: Function to handle file input change and parse PDF ---
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
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ') + '\n\n';
      }
      setStudyMaterials(fullText);
      toast({ title: 'Success', description: `Extracted text from ${file.name}.` });
    } catch (error) {
      console.error('Error parsing PDF:', error);
      toast({ title: 'Error', description: 'Failed to read or parse the PDF file.', variant: 'destructive' });
      setDocumentFile(null);
    } finally {
      setIsParsingPdf(false);
    }
  };

  // --- MODIFIED: Main submit handler to distinguish between text and document ---
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setIsLoading(true);
    setQuiz(null);

    // Final check for content before calling AI
    if (!studyMaterials.trim()) {
      const description = type === 'text'
        ? 'Please enter some text to generate a quiz.'
        : 'Could not extract text from the document. Please try another file.';
      toast({ title: 'Error', description, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      const result = await createQuiz({ studyMaterials, questionTypes, difficultyLevel, numberOfQuestions: parseInt(numberOfQuestions, 10) });
      setQuiz(result.quiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({ title: 'Error', description: 'Failed to create the quiz. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckAnswers = () => {
    console.log("User checked quiz answers.");
  };

  const allInteractionsDisabled = isLoading || isParsingPdf;

  return (
    <div className="p-4 md:p-8 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">AI Quiz Creator</h1>
        <p className="text-muted-foreground">Generate a quiz from your study materials to test your knowledge.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* --- MODIFIED: Replaced custom buttons with Tabs component for UI consistency --- */}
        <div>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Text Input</TabsTrigger>
              <TabsTrigger value="document"><FileUp className="mr-2 h-4 w-4" /> Upload PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle>From Text</CardTitle>
                  <CardDescription>Paste content to generate a quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'text')} className="space-y-4">
                    <Textarea
                      placeholder="Paste your study materials here..."
                      className="min-h-[250px] text-base"
                      value={studyMaterials}
                      onChange={(e) => setStudyMaterials(e.target.value)}
                      disabled={allInteractionsDisabled}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Form options are now inside the form */}
                      <Select value={difficultyLevel} onValueChange={setDifficultyLevel} disabled={allInteractionsDisabled}>
                        <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                        <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                      </Select>
                      <Select value={questionTypes} onValueChange={setQuestionTypes} disabled={allInteractionsDisabled}>
                        <SelectTrigger><SelectValue placeholder="Select question types" /></SelectTrigger>
                        <SelectContent><SelectItem value="multiple-choice">Multiple Choice</SelectItem><SelectItem value="true/false">True/False</SelectItem><SelectItem value="multiple-choice, true/false">Mixed Types</SelectItem></SelectContent>
                      </Select>
                      <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions} disabled={allInteractionsDisabled}>
                        <SelectTrigger><SelectValue placeholder="Select number" /></SelectTrigger>
                        <SelectContent><SelectItem value="5">5 Questions</SelectItem><SelectItem value="10">10 Questions</SelectItem><SelectItem value="15">15 Questions</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={allInteractionsDisabled || !studyMaterials.trim()} className="w-full">
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Create Quiz</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="document">
              <Card>
                <CardHeader>
                  <CardTitle>From PDF Document</CardTitle>
                  <CardDescription>Upload a PDF to extract text and create a quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'document')} className="space-y-4">
                     <div className="space-y-2 pt-8 pb-8">
                       <Label htmlFor="pdf-file" className="block text-center text-md font-medium">Upload PDF File</Label>
                       <Input id="pdf-file" type="file" onChange={handleFileChange} disabled={allInteractionsDisabled} className="w-fit mx-auto" accept=".pdf" />
                       {documentFile && <p className="text-sm text-muted-foreground text-center pt-2">Selected: {documentFile.name}</p>}
                       {isParsingPdf && <p className="text-sm text-muted-foreground flex items-center justify-center mt-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Extracting text...</p>}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Form options are also here for consistency */}
                      <Select value={difficultyLevel} onValueChange={setDifficultyLevel} disabled={allInteractionsDisabled}>
                        <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                        <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                      </Select>
                      <Select value={questionTypes} onValueChange={setQuestionTypes} disabled={allInteractionsDisabled}>
                        <SelectTrigger><SelectValue placeholder="Select question types" /></SelectTrigger>
                        <SelectContent><SelectItem value="multiple-choice">Multiple Choice</SelectItem><SelectItem value="true/false">True/False</SelectItem><SelectItem value="multiple-choice, true/false">Mixed Types</SelectItem></SelectContent>
                      </Select>
                      <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions} disabled={allInteractionsDisabled}>
                        <SelectTrigger><SelectValue placeholder="Select number" /></SelectTrigger>
                        <SelectContent><SelectItem value="5">5 Questions</SelectItem><SelectItem value="10">10 Questions</SelectItem><SelectItem value="15">15 Questions</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={allInteractionsDisabled || !documentFile} className="w-full">
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
              <CardDescription>Your quiz will appear here. Good luck!</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col gap-4 pt-4">
                  <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
                  <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
                  <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
                </div>
              ) : quiz ? (
                <QuizDisplay quiz={quiz} onCheckAnswers={handleCheckAnswers} />
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