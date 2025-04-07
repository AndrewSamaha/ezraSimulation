// Define a genotype as an array of numbers that can be mutated
// Allele might be more accurate?
// Genes might be more accurate? Let's just think of this as a genotype

import { SimulationObject } from "@/context/SimulationContext";

export type Genotype = number[];

export interface DNA {
  visualSearch: Genotype;   // How often the organism performs visual searches
//   nutrienceAwareness: Genotype; // How often the organism looks for nutrience in a visual search
//   organismAwareness: Genotype; // How often the organism looks for other organisms in a visual search

  nutrienceAffinity: Genotype;  // How often the organism approaches nutrience
  organismAffinity: Genotype;  // How often the organism approaches another organism

  nutrienceEating: Genotype;  // How often the organism consumes nutrience that is nearby
  organismEating: Genotype;  // How often the organism consumes another organism that is nearby

  stayEarningMultiplier: Genotype; // How much energy the organism earns by staying still
  eatEarningMultiplier: Genotype; // How much energy the organism earns by consuming

  energyGiftToOffspring: Genotype;
  reproductionProbability: Genotype;
  minimumEnergyToReproduce: Genotype;
};

export const isDNA = (obj: any): obj is DNA => {
  return obj !== null && typeof obj === 'object' && 'visualSearch' in obj && 'nutrienceAffinity' in obj && 'organismAffinity' in obj && 'nutrienceEating' in obj && 'organismEating' in obj && 'stayEarningMultiplier' in obj && 'eatEarningMultiplier' in obj && 'energyGiftToOffspring' in obj;
}

export const expressGene = (source: DNA | SimulationObject, gene: keyof DNA): number => {
  const sampleDNA: DNA = isDNA(source) ? source : (source as SimulationObject).dna!;
  const randomIndex = Math.floor(Math.random() * sampleDNA[gene].length);
  return sampleDNA[gene][randomIndex];
};

export interface PhenotypeRange {
  min: number,
  max: number,
  default: number
}

export const PhenotypeRanges: Record<keyof DNA, PhenotypeRange> = {
  visualSearch: { min: 0, max: 1, default: 0 },
  nutrienceAffinity: { min: -1, max: 1, default: 0 },
  organismAffinity: { min: -1, max: 1, default: 0 },
  nutrienceEating: { min: -1, max: 1, default: 0 },
  organismEating: { min: -1, max: 1, default: 0 },
  stayEarningMultiplier: { min: 0, max: 10, default: 1 },
  eatEarningMultiplier: { min: 0, max: 10, default: 1 },
  energyGiftToOffspring: { min: 0, max: 1, default: 0.5 },
  reproductionProbability: { min: 0.00001, max: 0.1, default: 0.033 },
  minimumEnergyToReproduce: { min: 0, max: 1000, default: 25 }
};

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
  visualSearch: [0],
  nutrienceAffinity: [0],
  organismAffinity: [0],
  nutrienceEating: [0],
  organismEating: [0],
  stayEarningMultiplier: [5],
  eatEarningMultiplier: [0],
  energyGiftToOffspring: [0.5],
  reproductionProbability: [0.033],
  minimumEnergyToReproduce: [25]
};

export const HERBIVORE_DNA_TEMPLATE: DNA = {
  visualSearch: [0],
  nutrienceAffinity: [0],
  organismAffinity: [1],
  nutrienceEating: [1],
  organismEating: [1],
  stayEarningMultiplier: [1],
  eatEarningMultiplier: [5],
  energyGiftToOffspring: [0.5],
  reproductionProbability: [0.011],
  minimumEnergyToReproduce: [200]
};

// export const CARNIVORE_DNA_TEMPLATE: DNA = {
//   visualSearch: [0],
//   nutrienceAffinity: [0],
//   organismAffinity: [1],
//   nutrienceEating: [0],
//   organismEating: [1],
//   stayEarningMultiplier: [1],
//   eatEarningMultiplier: [2]
// };

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
  (Object.keys(newDNA) as Array<keyof DNA>).forEach(trait => {
    const genotypes = newDNA[trait];
    const randomIndex = Math.floor(Math.random() * genotypes.length);
    if (Math.random() < mutationRate) {
      // Mutation: Randomly perturb the value
      const perturbation = (Math.random() - 0.5) * mutationMagnitude;
      newDNA[trait][randomIndex] += perturbation;
      
      // Ensure the value stays within valid range
      const range = PhenotypeRanges[trait];
      newDNA[trait][randomIndex] = Math.max(range.min, Math.min(range.max, newDNA[trait][randomIndex]));
    }
    if (Math.random() < copyGeneRate) {
      // Copy: Randomly copy a gene from another genotype
      const sourceIndex = Math.floor(Math.random() * genotypes.length);
      newDNA[trait].push(genotypes[sourceIndex]);
    }
  });
  
  return newDNA;
};
