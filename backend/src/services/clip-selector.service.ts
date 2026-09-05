import logger from '../utils/logger.js';
import { ClipCandidate, TranscriptSegment } from '../types/index.js';

export class ClipSelectorService {
  /**
   * Rank and select best moments from candidates
   */
  selectBestClips(
    candidates: ClipCandidate[],
    numberOfClips: number,
    transcript?: TranscriptSegment[]
  ): ClipCandidate[] {
    if (candidates.length === 0) {
      return [];
    }

    // Sort by score
    let sorted = [...candidates].sort((a, b) => b.score - a.score);

    // Remove excessive overlap
    sorted = this.removeOverlap(sorted, 5); // 5 second minimum gap

    // Remove duplicate topics
    sorted = this.removeDuplicateTopics(sorted);

    // Ensure variety in distribution
    sorted = this.ensureDistribution(sorted);

    // Adjust start/end to natural boundaries
    if (transcript) {
      sorted = this.adjustToNaturalBoundaries(sorted, transcript);
    }

    // Return top N clips
    return sorted.slice(0, numberOfClips);
  }

  private removeOverlap(clips: ClipCandidate[], minGap: number): ClipCandidate[] {
    const result: ClipCandidate[] = [];

    for (const clip of clips) {
      let hasOverlap = false;

      for (const existing of result) {
        const gap = Math.min(
          Math.abs(clip.start - existing.end),
          Math.abs(clip.end - existing.start)
        );
        if (gap < minGap) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        result.push(clip);
      }
    }

    return result;
  }

  private removeDuplicateTopics(clips: ClipCandidate[]): ClipCandidate[] {
    const seen = new Set<string>();
    return clips.filter((clip) => {
      if (seen.has(clip.topic)) {
        return false;
      }
      seen.add(clip.topic);
      return true;
    });
  }

  private ensureDistribution(clips: ClipCandidate[]): ClipCandidate[] {
    if (clips.length <= 1) return clips;

    // Sort by start time
    const byTime = [...clips].sort((a, b) => a.start - b.start);
    const result: ClipCandidate[] = [];
    const scoredClips = [...clips].sort((a, b) => b.score - a.score);

    for (const clip of scoredClips) {
      const lastClip = result[result.length - 1];
      if (!lastClip || clip.start > lastClip.end + 10) {
        result.push(clip);
      }
    }

    return result.sort((a, b) => a.start - b.start);
  }

  private adjustToNaturalBoundaries(
    clips: ClipCandidate[],
    transcript: TranscriptSegment[]
  ): ClipCandidate[] {
    return clips.map((clip) => {
      // Find segment closest to clip start
      let startSegment = transcript[0];
      for (const seg of transcript) {
        if (Math.abs(seg.start - clip.start) < Math.abs(startSegment.start - clip.start)) {
          startSegment = seg;
        }
      }

      // Find segment closest to clip end
      let endSegment = transcript[transcript.length - 1];
      for (const seg of transcript) {
        if (Math.abs(seg.end - clip.end) < Math.abs(endSegment.end - clip.end)) {
          endSegment = seg;
        }
      }

      return {
        ...clip,
        start: Math.max(0, startSegment.start),
        end: Math.min(endSegment.end, clip.end)
      };
    });
  }
}
