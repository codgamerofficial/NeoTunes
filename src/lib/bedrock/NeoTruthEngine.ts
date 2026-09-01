/**
 * NeoTruthEngine
 * Ensures every Neo response and data item carries verifiable provenance.
 * Sources:
 * - REAL_LIVE: Real-time active memory / audio player / hardware device stream
 * - REAL_DATABASE: Authoritative database (PostgreSQL / Supabase / IndexedDB)
 * - REAL_EXTERNAL_API: Live verified external integration (Spotify / Deezer / LRCLIB / YouTube)
 * - NEOTUNES_KNOWLEDGE: Platform documentation / Knowledge Base RAG
 * - MODEL_KNOWLEDGE: General AI reasoning (music theory, general conversation)
 * - UNKNOWN: Unverified or unavailable data (NEVER presented as fact)
 */

export type TruthSourceType =
  | 'REAL_LIVE'
  | 'REAL_DATABASE'
  | 'REAL_EXTERNAL_API'
  | 'NEOTUNES_KNOWLEDGE'
  | 'MODEL_KNOWLEDGE'
  | 'UNKNOWN';

export interface TruthProvenance {
  sourceType: TruthSourceType;
  sourceName: string;
  verifiedAt: string;
  isVerified: boolean;
  confidenceScore: number;
  auditDetails?: string;
}

export interface TruthBoundItem<T = any> {
  data: T;
  provenance: TruthProvenance;
}

export class NeoTruthEngine {
  /**
   * Tags raw data with verifiable provenance
   */
  public static tag<T>(
    data: T,
    sourceType: TruthSourceType,
    sourceName: string,
    confidence = 1.0,
    auditDetails?: string
  ): TruthBoundItem<T> {
    return {
      data,
      provenance: {
        sourceType,
        sourceName,
        verifiedAt: new Date().toISOString(),
        isVerified: sourceType !== 'UNKNOWN' && sourceType !== 'MODEL_KNOWLEDGE',
        confidenceScore: confidence,
        auditDetails,
      },
    };
  }

  /**
   * Validates if data is authoritative truth before user presentation
   */
  public static isAuthoritative(provenance: TruthProvenance): boolean {
    return (
      provenance.sourceType === 'REAL_LIVE' ||
      provenance.sourceType === 'REAL_DATABASE' ||
      provenance.sourceType === 'REAL_EXTERNAL_API' ||
      provenance.sourceType === 'NEOTUNES_KNOWLEDGE'
    );
  }

  /**
   * Generates a user-facing provenance chip badge label
   */
  public static getBadgeLabel(provenance: TruthProvenance): string {
    switch (provenance.sourceType) {
      case 'REAL_LIVE':
        return `Live Active State • ${provenance.sourceName}`;
      case 'REAL_DATABASE':
        return `NeoTunes Database • ${provenance.sourceName}`;
      case 'REAL_EXTERNAL_API':
        return `Verified Stream • ${provenance.sourceName}`;
      case 'NEOTUNES_KNOWLEDGE':
        return `Official Documentation • ${provenance.sourceName}`;
      case 'MODEL_KNOWLEDGE':
        return `General Knowledge`;
      case 'UNKNOWN':
      default:
        return `Unverified Data`;
    }
  }
}
