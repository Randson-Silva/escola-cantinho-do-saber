import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

export class ContractPricingPolicy {
  private static BASE_PRICES: Record<string, number> = {
    'DEFAULT': 100.00,
    [SchoolGrade.PRIMEIRO_ANO]: 100.00,
    [SchoolGrade.SEGUNDO_ANO]: 110.00,
    [SchoolGrade.TERCEIRO_ANO]: 120.00,
    [SchoolGrade.QUARTO_ANO]: 130.00,
    [SchoolGrade.QUINTO_ANO]: 140.00,
    [SchoolGrade.SEXTO_ANO]: 150.00,
    [SchoolGrade.SETIMO_ANO]: 160.00,
    [SchoolGrade.OITAVO_ANO]: 170.00,
    [SchoolGrade.NONO_ANO]: 180.00,
  };


  static calculate(grade: SchoolGrade, durationMinutes: number): number {
    const basePrice = this.BASE_PRICES[grade] || this.BASE_PRICES['DEFAULT'];

    let multiplier = 1.0;

    if (durationMinutes <= 90) {
      multiplier = 1.0; // 1h30
    } else if (durationMinutes <= 120) {
      multiplier = 1.5; // +30min
    } else if (durationMinutes >= 180) {
      multiplier = 2.0; // +1h30
    } else {
      // Regra de arredondamento para casos quebrados (ex: 100 min)
      const extraTime = durationMinutes > 90 ? durationMinutes - 90 : 0;
      const extraBlocks = Math.ceil(extraTime / 30);
      multiplier = 1.0 + (extraBlocks * 0.5);
    }

    return basePrice * multiplier;
  }
}
