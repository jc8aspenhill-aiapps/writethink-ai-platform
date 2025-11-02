import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ExportData {
  topic: string;
  thesisOrClaim: string;
  studentNotes: Record<string, string>;
  chatHistory: ChatMessage[];
  developmentData?: any;
}

export const exportToWordDocument = async (data: ExportData) => {
  const { topic, thesisOrClaim, studentNotes, chatHistory, developmentData } = data;

  // Create document sections
  const docElements = [
    // Title
    new Paragraph({
      text: "WriteThink AI - Argument Development Worksheet",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),

    // Topic and Thesis
    new Paragraph({
      text: "Topic & Initial Position",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 }
    }),

    new Paragraph({
      children: [
        new TextRun({ text: "Topic: ", bold: true }),
        new TextRun({ text: topic || "[Not provided]" })
      ],
      spacing: { after: 100 }
    }),

    new Paragraph({
      children: [
        new TextRun({ text: "Initial Thesis/Claim: ", bold: true }),
        new TextRun({ text: thesisOrClaim || "[Not provided]" })
      ],
      spacing: { after: 300 }
    }),
  ];

  // Add Clarifying Questions Section
  const clarifyingNotes = Object.entries(studentNotes).filter(([key]) => key.startsWith('clarifying'));
  if (clarifyingNotes.length > 0 && developmentData?.clarifyingQuestions) {
    docElements.push(
      new Paragraph({
        text: "Clarifying Questions",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 }
      })
    );

    clarifyingNotes.forEach(([key, value], index) => {
      const questionIndex = parseInt(key.split('-')[1]) || index;
      const originalQuestion = developmentData.clarifyingQuestions[questionIndex];
      
      if (originalQuestion) {
        docElements.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${index + 1}. `, bold: true }),
              new TextRun({ text: String(originalQuestion), italics: true })
            ],
            spacing: { before: 100, after: 50 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Your Response: ", bold: true }),
              new TextRun({ text: value || "[No response provided]" })
            ],
            indent: { left: 360 },
            spacing: { after: 200 }
          })
        );
      }
    });
  }

  // Add Thinking Prompts Section
  const thinkingNotes = Object.entries(studentNotes).filter(([key]) => key.startsWith('thinking'));
  if (thinkingNotes.length > 0 && developmentData?.thinkingPrompts) {
    docElements.push(
      new Paragraph({
        text: "Thinking Prompts",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 }
      })
    );

    thinkingNotes.forEach(([key, value]) => {
      const promptKey = key.replace('thinking-', '');
      const originalPrompt = developmentData.thinkingPrompts[promptKey];
      
      if (originalPrompt) {
        const promptTitle = {
          'whatDoYouBelieve': 'What Do You Believe?',
          'whyDoesItMatter': 'Why Does It Matter?',
          'whatIsTheDebate': 'What Is The Debate?'
        }[promptKey] || promptKey;

        docElements.push(
          new Paragraph({
            children: [
              new TextRun({ text: promptTitle, bold: true, underline: { type: UnderlineType.SINGLE } })
            ],
            spacing: { before: 100, after: 50 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: String(originalPrompt), italics: true })
            ],
            spacing: { after: 50 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Your Response: ", bold: true }),
              new TextRun({ text: value || "[No response provided]" })
            ],
            indent: { left: 360 },
            spacing: { after: 200 }
          })
        );
      }
    });
  }

  // Add simple structure notes for any other responses
  const otherNotes = Object.entries(studentNotes).filter(([key]) => 
    !key.startsWith('clarifying') && !key.startsWith('thinking')
  );
  
  if (otherNotes.length > 0) {
    docElements.push(
      new Paragraph({
        text: "Additional Development Notes",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 }
      })
    );

    otherNotes.forEach(([key, value]) => {
      const cleanKey = key.replace(/^[^-]+-/, '').replace(/-/g, ' ');
      
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${cleanKey}: `, bold: true }),
            new TextRun({ text: value || "[No response provided]" })
          ],
          spacing: { after: 150 }
        })
      );
    });
  }

  // Add chat conversation if available
  if (chatHistory.length > 0) {
    docElements.push(
      new Paragraph({
        text: "Coaching Conversation",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    chatHistory.forEach((message) => {
      const isUser = message.role === 'user';
      const speaker = isUser ? "You" : "AI Coach";
      
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({ 
              text: `${speaker}: `, 
              bold: true,
              color: isUser ? "0066CC" : "CC6600"
            }),
            new TextRun({ text: message.content })
          ],
          spacing: { after: 100 },
          indent: { left: isUser ? 0 : 200 }
        })
      );
    });
  }

  // Add development guidance if available
  if (developmentData?.nextSteps?.length > 0) {
    docElements.push(
      new Paragraph({
        text: "Next Steps for Development",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    developmentData.nextSteps.forEach((step: string, index: number) => {
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. `, bold: true }),
            new TextRun({ text: String(step) })
          ],
          spacing: { after: 100 }
        })
      );
    });
  }

  // Footer
  docElements.push(
    new Paragraph({
      text: "",
      spacing: { before: 500 }
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: "Generated by WriteThink AI Platform", 
          italics: true,
          size: 18,
          color: "666666"
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: "Designed by Lemiscatemind.com", 
          italics: true,
          size: 18,
          color: "666666"
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: `Exported on ${new Date().toLocaleDateString()}`, 
          italics: true,
          size: 18,
          color: "666666"
        })
      ],
      alignment: AlignmentType.CENTER
    })
  );

  // Create the document
  const doc = new Document({
    sections: [{
      properties: {},
      children: docElements
    }],
    creator: "WriteThink AI Platform - Designed by Lemiscatemind.com",
    title: `Argument Development - ${topic}`,
    description: "Student thinking and development process created with WriteThink AI",
  });

  // Generate and download the file
  try {
    const blob = await Packer.toBlob(doc);
    const fileName = `WriteThink_AI_${topic.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
    return true;
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate Word document');
  }
};