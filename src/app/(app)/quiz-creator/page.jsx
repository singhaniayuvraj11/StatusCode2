'use client';

import { useState } from 'react';
import { createQuiz } from '@/ai/flows/create-quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

function QuizDisplay({ quiz, onCheckAnswers }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer,
    });
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correctCount++;
      }
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
  }
  
  const getResultIcon = (index, option) => {
      if (!submitted) return null;
      const question = quiz[index];
      const isCorrect = question.answer === option;
      const isSelected = answers[index] === option;

      if(isCorrect) return <CheckCircle className="h-4 w-4 text-green-500 ml-2" />;
      if(isSelected && !isCorrect) return <XCircle className="h-4 w-4 text-red-500 ml-2" />;
      return null;
  }

  return (
    <div className="space-y-6">
      {submitted && (
        <Card className="bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center gap-4">
              <Trophy className="h-10 w-10 text-yellow-500"/>
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
            <RadioGroup
              value={answers[index] || ''}
              onValueChange={(value) => handleAnswerChange(index, value)}
              disabled={submitted}
            >
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
  const [questionTypes, setQuestionTypes] = useState('multiple-choice, true/false');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studyMaterials.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide study materials to generate a quiz.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setQuiz(null);

    try {
      const result = await createQuiz({ studyMaterials, questionTypes, difficultyLevel, numberOfQuestions: parseInt(numberOfQuestions, 10) });
      setQuiz(result.quiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckAnswers = () => {
    // This function can be used to trigger analytics or other actions when the user checks answers.
    console.log("User checked quiz answers.");
  };

  return (
    <div className="p-4 md:p-8 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">AI Quiz Creator</h1>
        <p className="text-muted-foreground">Generate a quiz from your study materials to test your knowledge.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Configuration</CardTitle>
            <CardDescription>Provide your study material and configure the quiz options.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="study-materials">Study Materials</Label>
                <Textarea
                  id="study-materials"
                  placeholder="Paste your notes or study materials here..."
                  className="min-h-[250px] text-base"
                  value={studyMaterials}
                  onChange={(e) => setStudyMaterials(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficultyLevel} onValueChange={setDifficultyLevel} disabled={isLoading}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question-types">Question Type</Label>
                  <Select value={questionTypes} onValueChange={setQuestionTypes} disabled={isLoading}>
                    <SelectTrigger id="question-types">
                      <SelectValue placeholder="Select question types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true/false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="multiple-choice, true/false">Mixed Types</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num-questions">Number of Questions</Label>
                  <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions} disabled={isLoading}>
                    <SelectTrigger id="num-questions">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={isLoading || !studyMaterials.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Create Quiz
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="h-full">
          {isLoading ? (
             <Card className="min-h-[570px]">
                <CardHeader>
                    <CardTitle>Generated Quiz</CardTitle>
                    <CardDescription>Your quiz will appear here. Good luck!</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                    <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
                    <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
                    <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
                </CardContent>
            </Card>
          ) : quiz ? (
            <QuizDisplay quiz={quiz} onCheckAnswers={handleCheckAnswers} />
          ) : (
            <Card className="min-h-[570px]">
                <CardHeader>
                    <CardTitle>Generated Quiz</CardTitle>
                    <CardDescription>Your quiz will appear here. Good luck!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[420px] text-muted-foreground">
                        <p>Your quiz will be generated here.</p>
                    </div>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
