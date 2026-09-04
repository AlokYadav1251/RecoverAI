import { IAIProvider } from './aiProvider.interface';
import { DeterministicAIProvider } from './deterministicAIProvider';

export class AIProviderFactory {
  private static instance: IAIProvider;

  public static getProvider(): IAIProvider {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new DeterministicAIProvider();
    }
    return AIProviderFactory.instance;
  }
}

