// Define a genotype as an array of numbers that can be mutated
// Allele might be more accurate?
// Genes might be more accurate? Let's just think of this as a genotype

import { SimulationObject, ObjectTypeEnum, ObjectTypes } from "@/context/SimulationContext";

export type Genotype = number[];

// Create mapped types that will automatically add properties for each object type
export type AffinityMap = {
  [K in ObjectTypeEnum as `${K}Affinity`]: Genotype;
};

export type EatingMap = {
  [K in ObjectTypeEnum as `${K}Eating`]: Genotype;
};

// Combine them into the DNA interface
export interface DNA extends AffinityMap, EatingMap {
  visualSearch: Genotype;
  stayEarningMultiplier: Genotype;
  eatEarningMultiplier: Genotype;
  energyGiftToOffspring: Genotype;
  reproductionProbability: Genotype;
  minimumEnergyToReproduce: Genotype;
  lineageName: string;
};

export const isDNA = (obj: any): obj is DNA => {
  return obj !== null && typeof obj === 'object' && 'visualSearch' in obj && 'stayEarningMultiplier' in obj && 'eatEarningMultiplier' in obj && 'energyGiftToOffspring' in obj && 'reproductionProbability' in obj && 'minimumEnergyToReproduce' in obj;
}

export const expressGene = (source: DNA | SimulationObject, gene: keyof DNA): number => {
  const sampleDNA: DNA = isDNA(source) ? source : (source as SimulationObject).dna!;
  const randomIndex = Math.floor(Math.random() * sampleDNA[gene].length);
  if (gene === 'lineageName') {
    throw new Error('Cannot express gene lineageName');
  }
  return sampleDNA[gene][randomIndex];
};

export interface PhenotypeRange {
  min: number,
  max: number,
  default: number
}

// Base phenotype ranges for standard properties
const basePhenotypeRanges: Partial<Record<keyof DNA, PhenotypeRange>> = {
  visualSearch: { min: 0, max: 1, default: 0 },
  stayEarningMultiplier: { min: 0, max: 10, default: 1 },
  eatEarningMultiplier: { min: 0, max: 10, default: 1 },
  energyGiftToOffspring: { min: 0, max: 1, default: 0.5 },
  reproductionProbability: { min: 0.00001, max: 0.1, default: 0.033 },
  minimumEnergyToReproduce: { min: 0, max: 1000, default: 25 }
};

// Function to create a complete PhenotypeRanges object with dynamic properties
const createPhenotypeRanges = (): Record<keyof DNA, PhenotypeRange> => {
  // Start with the base ranges
  const ranges = { ...basePhenotypeRanges } as Record<keyof DNA, PhenotypeRange>;
  
  // Add ranges for each object type's affinity and eating properties
  // Use direct string values to avoid circular dependencies or SSR issues
  const objectTypes = ['organism', 'nutrience'] as const;
  objectTypes.forEach((type) => {
    // Add ranges for affinity (how likely to approach this type)
    ranges[`${type}Affinity` as keyof DNA] = { min: -1, max: 1, default: 0 };
    
    // Add ranges for eating (how likely to eat this type)
    ranges[`${type}Eating` as keyof DNA] = { min: -1, max: 1, default: 0 };
  });
  
  return ranges;
};

// Create the dynamic PhenotypeRanges object
export const PhenotypeRanges = createPhenotypeRanges();

// Mutation
// Here's mutation function for the DNA to work with
// What values should each of these be?
// How to represent this? Is a genotype a fixed length? Or a variable one?
// Does each step in the simulation decode one gene each time?
// Or should each step pick a random value from the genotypes it has?

// Sexual Reproduction???? Let' stick with asexual reproduction for now
// How do organisms pick a mate?
// How do the genes mix?


// Decode the genotype to get a phenotype
// All of the genotypes should range from values from -1 to 1
// To get to this, we take the value and divide by the max

// What are our phenotype values? So far we have movement & possibly vision.

export const PLANT_DNA_TEMPLATE: DNA = {
  organismAffinity: [0],
  nutrienceAffinity: [0],
  organismEating: [0],
  nutrienceEating: [0],
  visualSearch: [0],
  stayEarningMultiplier: [5],
  eatEarningMultiplier: [0],
  energyGiftToOffspring: [0.5],
  reproductionProbability: [0.033],
  minimumEnergyToReproduce: [25],
  lineageName: 'Plant'
};

export const HERBIVORE_DNA_TEMPLATE: DNA = {
  organismAffinity: [0],
  nutrienceAffinity: [0],
  organismEating: [0],
  nutrienceEating: [0],
  visualSearch: [0],
  stayEarningMultiplier: [1],
  eatEarningMultiplier: [5],
  energyGiftToOffspring: [0.5],
  reproductionProbability: [0.011],
  minimumEnergyToReproduce: [200],
  lineageName: 'Herbivore'
};

/**
 * Mutates the provided DNA by randomly changing values based on the mutation rate.
 * Each genotype in the DNA has a chance to be mutated proportional to the mutation rate.
 * 
 * @param dna - The DNA object to be mutated containing genotypes for various traits
 * @param mutationRate - A value between 0 and 1 representing the probability of mutation
 *                      (0 = no mutation, 1 = 100% mutation chance for each gene)
 * @returns A new DNA object with potentially mutated values
 * 
 * @example
 * // Create a mutated version of an organism's DNA with a 5% mutation rate
 * const childDNA = mutateDNA(parentOrganism.dna, 0.05);
 * 
 * @remarks
 * - Mutations are random perturbations of the original values
 * - The function creates a new DNA object rather than modifying the original
 * - Mutation strength is proportional to the mutation rate
 * - Some genotypes may have constraints on their valid ranges
 */
export const mutateDNA = (dna: DNA, mutationRate: number, mutationMagnitude: number = 0.5, copyGeneRate: number = 0.1): DNA => {
  // Create a deep copy to avoid modifying the original
  if (dna === undefined) {
    throw new Error('DNA cannot be undefined');
  }
  const newDNA: DNA = JSON.parse(JSON.stringify(dna));
  
  // Iterate through each trait in the DNA object
  (Object.keys(newDNA) as Array<keyof DNA>).filter((trait) => trait !== 'lineageName').forEach(trait => {
    const genotypes = newDNA[trait];
    const randomIndex = Math.floor(Math.random() * genotypes.length);
    if (Math.random() < mutationRate) {
      // Mutation: Randomly perturb the value
      const perturbation = (Math.random() - 0.5) * mutationMagnitude;
      newDNA[trait][randomIndex] += perturbation;
      
      // Ensure the value stays within valid range
      const range = PhenotypeRanges[trait];
      if (range) {
        newDNA[trait][randomIndex] = Math.max(range.min, Math.min(range.max, newDNA[trait][randomIndex]));
      }
    }
    if (Math.random() < copyGeneRate) {
      // Copy: Randomly copy a gene from another genotype
      const sourceIndex = Math.floor(Math.random() * genotypes.length);
      newDNA[trait].push(genotypes[sourceIndex]);
    }
  });
  
  return newDNA;
};
