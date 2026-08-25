'use client';

import { GraphEdge, GraphRelationType } from '@/types/music-graph';

export class NeoMusicGraph {
  private static edges: GraphEdge[] = [
    { sourceId: 'spotify:track:shayad', targetId: 'spotify:track:tum_hi_ho', relationType: 'SIMILAR_TO', confidence: 0.95, origin: 'EDITORIAL' },
    { sourceId: 'spotify:track:shayad', targetId: 'spotify:track:kesariya', relationType: 'SAME_ARTIST', confidence: 0.99, origin: 'METADATA' },
  ];

  public static addEdge(edge: GraphEdge): void {
    NeoMusicGraph.edges.push(edge);
  }

  /**
   * Queries connected graph target IDs for a canonical node (Section 10 & 38)
   */
  public static getRelatedTargetIds(nodeId: string, relationType?: GraphRelationType): string[] {
    return NeoMusicGraph.edges
      .filter((e) => e.sourceId === nodeId && (!relationType || e.relationType === relationType))
      .map((e) => e.targetId);
  }
}
