'use client';

import { useState } from 'react';
import { summarizeDocument } from '@/ai/flows/summarize-document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, FileUp, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DocumentSummarizerPage() {
  const [documentText, setDocumentText] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // new states for customization
  const [detailLevel, setDetailLevel] = useState('medium');
  const [customLength, setCustomLength] = useState('');
  const [tone, setTone] = useState('academic');

  const { toast } = useToast();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
    setSummary(null);

    try {
      let result;
      const options = { detailLevel, customLength, tone };

      if (type === 'text') {
        if (!documentText.trim()) {
          toast({
            title: 'Error',
            description: 'Please enter some text to summarize.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        result = await summarizeDocument({ documentText, ...options });
      } else {
        if (!documentFile) {
          toast({ title: 'Error', description: 'Please upload a document file.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const dataUri = await fileToDataUri(documentFile);
        const document = { dataUri };
        result = await summarizeDocument({ document, ...options });
      }
      setSummary(result);
    } catch (error) {
      console.error('Error summarizing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to summarize the document. The uploaded file format may not be supported by the AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Document Summarizer</h1>
        <p className="text-muted-foreground">Paste text or upload a document to get a customized AI-generated summary.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Text Input</TabsTrigger>
              <TabsTrigger value="document"><FileUp className="mr-2 h-4 w-4" /> Document Upload</TabsTrigger>
            </TabsList>

            {/* TEXT TAB */}
            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle>From Text</CardTitle>
                  <CardDescription>Paste the content you want to summarize.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'text')} className="space-y-4">
                    <Textarea
                      placeholder="Paste your document text here..."
                      className="min-h-[200px] text-base"
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      disabled={isLoading}
                    />

                    {/* Customization controls */}
                    <div className="space-y-2">
                      <Label>Detail Level</Label>
                      <Select value={detailLevel} onValueChange={setDetailLevel}>
                        <SelectTrigger><SelectValue placeholder="Select detail level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Length (optional)</Label>
                      <Input
                        placeholder="e.g. 100 words, 5 bullet points"
                        value={customLength}
                        onChange={(e) => setCustomLength(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tone / Style</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger><SelectValue placeholder="Select tone" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="simplified">Simplified</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="bullet">Bullet Notes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" disabled={isLoading || !documentText.trim()} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Summarize Text
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DOCUMENT TAB */}
            <TabsContent value="document">
              <Card>
                <CardHeader>
                  <CardTitle>From Document</CardTitle>
                  <CardDescription>Upload a document file to get a summary.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'document')} className="space-y-4">
                    <div className="space-y-2 pt-6">
                      <Label htmlFor="doc-file" className="block">Upload Document File</Label>
                      <Input id="doc-file" type="file" onChange={handleFileChange} disabled={isLoading} />
                      {documentFile && <p className="text-sm text-muted-foreground pt-2">Selected: {documentFile.name}</p>}
                    </div>

                    {/* same customization for document */}
                    <div className="space-y-2">
                      <Label>Detail Level</Label>
                      <Select value={detailLevel} onValueChange={setDetailLevel}>
                        <SelectTrigger><SelectValue placeholder="Select detail level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Length (optional)</Label>
                      <Input
                        placeholder="e.g. 200 words, 10 bullet points"
                        value={customLength}
                        onChange={(e) => setCustomLength(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tone / Style</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger><SelectValue placeholder="Select tone" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="simplified">Simplified</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="bullet">Bullet Notes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" disabled={isLoading || !documentFile} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2 h-4 w-4" />
                          Upload & Summarize
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* SUMMARY PANEL */}
        <Card className="min-h-[500px]">
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
            <CardDescription>This is the generated summary of your document.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 pt-4">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
            ) : summary ? (
              <ScrollArea className="h-[380px]">
                <p className="text-foreground/90 whitespace-pre-wrap">{summary.summary}</p>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[380px] text-muted-foreground">
                <p>Your summary will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
