import { IPaymentProvider } from './paymentProvider.interface';
import { MockPaymentProvider } from './mockPaymentProvider';
import { isDemoMode } from '@/config/env';

export class PaymentProviderFactory {
  private static mockInstance: IPaymentProvider;

  public static getProvider(): IPaymentProvider {
    // In Phase 1 and whenever DEMO_MODE=true, always return the MockPaymentProvider
    if (!PaymentProviderFactory.mockInstance) {
      PaymentProviderFactory.mockInstance = new MockPaymentProvider();
    }
    return PaymentProviderFactory.mockInstance;
  }
}
