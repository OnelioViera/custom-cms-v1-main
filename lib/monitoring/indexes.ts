import { getDatabase } from '../mongodb';

interface IndexReport {
  indexCount: number;
  indexes: string[];
  documentCount: number;
}

interface QueryPerformanceResult {
  executionTime: number;
  documentsExamined: number;
  documentsReturned: number;
  indexUsed: string;
}

interface ExecutionStages {
  indexName?: string;
}

interface ExecutionStats {
  executionTimeMillis?: number;
  totalDocsExamined?: number;
  nReturned?: number;
  executionStages?: ExecutionStages;
}

export async function checkIndexes(): Promise<Record<string, IndexReport>> {
  const db = await getDatabase();
  const collections = ['pages', 'projects', 'team', 'services', 'users'];
  
  const report: Record<string, IndexReport> = {};

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();
    const documentCount = await collection.countDocuments();
    
    report[collectionName] = {
      indexCount: indexes.length,
      indexes: indexes.map((i: { name?: string }) => i.name || 'unknown'),
      documentCount,
    };
  }

  return report;
}

export async function analyzeQueryPerformance(
  collectionName: string,
  query: Record<string, unknown>
): Promise<QueryPerformanceResult> {
  const db = await getDatabase();
  const collection = db.collection(collectionName);
  
  // Use explain to analyze query performance
  const explanation = await collection.find(query).explain('executionStats');
  const executionStats = (explanation.executionStats as ExecutionStats) || {};
  
  return {
    executionTime: executionStats.executionTimeMillis || 0,
    documentsExamined: executionStats.totalDocsExamined || 0,
    documentsReturned: executionStats.nReturned || 0,
    indexUsed: executionStats.executionStages?.indexName || 'collection scan',
  };
}
