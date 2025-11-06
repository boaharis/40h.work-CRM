import { QuoteLineItem, Quote } from '@/types';

export interface QuoteCalculationResult {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  estimatedCost: number;
  margin: number;
  marginPercentage: number;
}

export class QuoteCalculator {
  private lineItems: QuoteLineItem[];
  private taxRate: number;
  private discountPercentage: number;
  private discountAmount: number;

  constructor(
    lineItems: QuoteLineItem[],
    taxRate: number = 0,
    discountPercentage: number = 0,
    discountAmount: number = 0
  ) {
    this.lineItems = lineItems;
    this.taxRate = taxRate;
    this.discountPercentage = discountPercentage;
    this.discountAmount = discountAmount;
  }

  calculate(): QuoteCalculationResult {
    // Calculate subtotal
    const subtotal = this.lineItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate discount
    let totalDiscount = this.discountAmount;
    if (this.discountPercentage > 0) {
      totalDiscount = subtotal * (this.discountPercentage / 100);
    }

    // Calculate taxable amount (subtotal minus discount)
    const taxableAmount = subtotal - totalDiscount;

    // Calculate tax only on taxable items
    const taxableItemsTotal = this.lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.total, 0);

    const taxAmount = (taxableItemsTotal - (totalDiscount * (taxableItemsTotal / subtotal))) * (this.taxRate / 100);

    // Calculate total
    const total = subtotal - totalDiscount + taxAmount;

    // Calculate cost and margin
    const estimatedCost = this.lineItems.reduce((sum, item) => {
      return sum + (item.costTotal || 0);
    }, 0);

    const margin = total - estimatedCost;
    const marginPercentage = total > 0 ? (margin / total) * 100 : 0;

    return {
      subtotal,
      taxAmount,
      discountAmount: totalDiscount,
      total,
      estimatedCost,
      margin,
      marginPercentage,
    };
  }

  static calculateLineItem(
    quantity: number,
    unitPrice: number,
    unitCost: number = 0
  ): { total: number; costTotal: number } {
    return {
      total: quantity * unitPrice,
      costTotal: quantity * unitCost,
    };
  }

  static applyFormula(formula: string, context: Record<string, number>): number {
    try {
      // Replace variables in formula with actual values
      let evaluableFormula = formula;

      Object.entries(context).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluableFormula = evaluableFormula.replace(regex, value.toString());
      });

      // Safely evaluate the formula
      // In production, you'd want to use a proper math expression parser
      // like mathjs or implement a safe evaluator
      const result = Function(`'use strict'; return (${evaluableFormula})`)();

      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return 0;
    }
  }

  // Predefined formulas for moving industry
  static movingVolumeFormula(
    rooms: number,
    avgRoomSize: number = 150, // sq ft
    packingFactor: number = 1.2 // packing efficiency
  ): number {
    return rooms * avgRoomSize * packingFactor;
  }

  static movingCostFormula(
    volume: number,
    distance: number,
    ratePerCubicFoot: number = 0.5,
    ratePerMile: number = 2.0,
    baseRate: number = 200
  ): number {
    const volumeCost = volume * ratePerCubicFoot;
    const distanceCost = distance * ratePerMile;
    return baseRate + volumeCost + distanceCost;
  }

  static laborCostFormula(
    hours: number,
    workers: number,
    hourlyRate: number = 50
  ): number {
    return hours * workers * hourlyRate;
  }

  static storageCostFormula(
    cubicFeet: number,
    months: number,
    ratePerCubicFoot: number = 0.75
  ): number {
    return cubicFeet * months * ratePerCubicFoot;
  }
}

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Helper function to format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
