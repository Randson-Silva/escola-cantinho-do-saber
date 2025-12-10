export class TimeUtils {
  /**
   * Converte "13:30" para minutos totais (810)
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Converte minutos totais (810) para "13:30"
   */
  static minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /**
   * Gera os blocos de 30 minutos necessários para um intervalo.
   * Ex: 13:00 às 14:00 -> Retorna [{start: 780, end: 810}, {start: 810, end: 840}]
   */
  static generateTimeBlocks(startStr: string, endStr: string, intervalMin = 30) {
    const startMin = this.timeToMinutes(startStr);
    const endMin = this.timeToMinutes(endStr);
    const blocks: { start: number; end: number; label: string }[] = [];

    for (let current = startMin; current < endMin; current += intervalMin) {
      blocks.push({
        start: current,
        end: current + intervalMin,
        label: `${this.minutesToTime(current)}-${this.minutesToTime(current + intervalMin)}`,
      });
    }

    return blocks;
  }

  /**
   * Verifica se dois intervalos se sobrepõem
   */
  static hasOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
    return startA < endB && endA > startB;
  }
}
