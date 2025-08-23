'use client';

import { useState } from 'react';
import { generateNotes } from '@/ai/flows/generate-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, FileUp, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function NotesDisplay({ notes }) {
  if (!notes) return null;

  return (
    <Tabs defaultValue="bullets" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="bullets">Bullets</TabsTrigger>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="qna">Q&A</TabsTrigger>
      </TabsList>
      <ScrollArea className="h-[400px] mt-4">
        <TabsContent value="bullets">
          <p className="text-foreground/90 whitespace-pre-wrap">{notes.bullets}</p>
        </TabsContent>
        <TabsContent value="summary">
          <p className="text-foreground/90 whitespace-pre-wrap">{notes.summary}</p>
        </TabsContent>
        <TabsContent value="table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Topic</TableHead>
                  <TableHead className="w-[50%]">Key Points</TableHead>
                  <TableHead className="w-[25%]">Examples</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.table.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium align-top">{row.topic}</TableCell>
                    <TableCell className="whitespace-pre-wrap align-top">{row.keyPoints}</TableCell>
                    <TableCell className="whitespace-pre-wrap align-top">{row.examples}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </TabsContent>
        <TabsContent value="qna">
          <Accordion type="single" collapsible className="w-full">
            {notes.qna.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground/90 whitespace-pre-wrap">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}

export default function NoteGeneratorPage() {
  const [inputText, setInputText] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [notes, setNotes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Loosening the file type check to allow more document types that the model might support
      setDocumentFile(file);
    }
  };

  const fileToDataUri = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setIsLoading(true);
    setNotes(null);

    try {
      let result;
      if (type === 'text') {
        if (!inputText.trim()) {
          toast({ title: 'Error', description: 'Please enter some text.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        result = await generateNotes({ text: inputText });
      } else {
        if (!documentFile) {
          toast({ title: 'Error', description: 'Please upload a document file.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const dataUri = await fileToDataUri(documentFile);
        const document = {
            dataUri: dataUri
        }
        result = await generateNotes({ document });
      }
      setNotes(result);
    } catch (error) {
      console.error('Error generating notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate notes. The uploaded file format may not be supported by the AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">AI Note Generator</h1>
        <p className="text-muted-foreground">Generate structured notes from text or by uploading a document.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Text Input</TabsTrigger>
              <TabsTrigger value="document"><FileUp className="mr-2 h-4 w-4" /> Document Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle>From Text</CardTitle>
                  <CardDescription>Paste any text content to generate notes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'text')} className="space-y-4">
                    <Textarea
                      placeholder="Paste your text here..."
                      className="min-h-[300px] text-base"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !inputText.trim()} className="w-full">
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Notes</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="document">
              <Card>
                <CardHeader>
                  <CardTitle>From Document</CardTitle>
                  <CardDescription>Upload a document file. Supported formats depend on the AI model.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'document')} className="space-y-4">
                    <div className="space-y-2 pt-16 pb-16">
                      <Label htmlFor="doc-file" className="block text-center text-lg">Upload Document File</Label>
                      <Input id="doc-file" type="file" onChange={handleFileChange} disabled={isLoading} className="w-fit mx-auto" />
                      {documentFile && <p className="text-sm text-muted-foreground text-center pt-2">Selected: {documentFile.name}</p>}
                    </div>
                    <Button type="submit" disabled={isLoading || !documentFile} className="w-full">
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FileUp className="mr-2 h-4 w-4" /> Upload & Generate</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="min-h-[550px]">
          <CardHeader>
            <CardTitle>Generated Notes</CardTitle>
            <CardDescription>Your AI-generated notes will appear below.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 pt-4">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
            ) : notes ? (
              <NotesDisplay notes={notes} />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <p>Notes will be generated here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
