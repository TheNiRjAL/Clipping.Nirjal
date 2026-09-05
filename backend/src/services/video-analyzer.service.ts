import logger from '../utils/logger.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ClipCandidate, TranscriptSegment } from '../types/index.js';
import { spawn } from 'child_process';

export class VideoAnalyzerService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analyze video using Gemini AI to find viral moments
   */
  async analyzeVideo(
    videoPath: string,
    duration: number,
    transcript?: TranscriptSegment[]
  ): Promise<ClipCandidate[]> {
    try {
      logger.info(`Analyzing video for viral moments: ${videoPath}`);

      // If we have transcript, use it for context
      const transcriptText = this.formatTranscript(transcript);

      // Create prompt for Gemini
      const prompt = this.buildAnalysisPrompt(duration, transcriptText);

      // Call Gemini API
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse response into candidates
      const candidates = this.parseAnalysisResponse(responseText, duration);

      logger.info(`Found ${candidates.length} viral moment candidates`);
      return candidates;
    } catch (error) {
      logger.error('Video analysis failed:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(duration: number, transcript: string): string {
    return `You are a viral video content expert. Analyze this video description and identify 15-30 potential viral moments.

Video Duration: ${duration} seconds

${transcript ? `Transcript:\n${transcript}` : 'No transcript available'}

For each moment, identify:
1. Start time (seconds)
2. End time (seconds)
3. Hook (one-liner)
4. Title
5. Reason why it's viral
6. Topic
7. Emotional value (0-10)
8. Curiosity factor (0-10)
9. Usefulness (0-10)
10. Standalone completeness (0-10)

Focus on:
- Strong hooks and openings
- Surprising or controversial statements
- Emotional moments
- Useful information
- Funny moments
- Unexpected reveals
- Strong reactions
- Storytelling payoffs
- Actionable advice
- Memorable statements

Avoid:
- Introductions/greetings
- Dead air
- Filler content
- Incomplete thoughts

Respond in JSON format:
[
  {
    "start": number,
    "end": number,
    "hook": "string",
    "title": "string",
    "reason": "string",
    "topic": "string",
    "emotionalValue": number,
    "curiosity": number,
    "usefulness": number,
    "standaloneCompleteness": number
  }
]
`;
  }

  private parseAnalysisResponse(response: string, duration: number): ClipCandidate[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        logger.warn('Could not find JSON in response');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const candidates: ClipCandidate[] = [];

      for (const item of parsed) {
        // Validate timestamps
        if (item.start >= 0 && item.end > item.start && item.end <= duration) {
          const score = this.calculateScore({
            emotionalValue: item.emotionalValue || 0,
            curiosity: item.curiosity || 0,
            usefulness: item.usefulness || 0,
            standaloneCompleteness: item.standaloneCompleteness || 0
          });

          candidates.push({
            start: item.start,
            end: item.end,
            duration: item.end - item.start,
            score,
            hook: item.hook || '',
            title: item.title || '',
            reason: item.reason || '',
            topic: item.topic || '',
            emotionalValue: item.emotionalValue || 0,
            curiosity: item.curiosity || 0,
            usefulness: item.usefulness || 0,
            standaloneCompleteness: item.standaloneCompleteness || 0
          });
        }
      }

      return candidates;
    } catch (error) {
      logger.error('Failed to parse analysis response:', error);
      return [];
    }
  }

  private calculateScore(metrics: {
    emotionalValue: number;
    curiosity: number;
    usefulness: number;
    standaloneCompleteness: number;
  }): number {
    // Weighted scoring
    const weights = {
      emotionalValue: 0.25,
      curiosity: 0.25,
      usefulness: 0.25,
      standaloneCompleteness: 0.25
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += metrics[key as keyof typeof metrics] * weight;
    }

    return Math.round(score);
  }

  private formatTranscript(transcript?: TranscriptSegment[]): string {
    if (!transcript || transcript.length === 0) {
      return '';
    }

    return transcript
      .map((seg) => `[${seg.start}s-${seg.end}s]: ${seg.text}`)
      .join('\n');
  }
}
