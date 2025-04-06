// This file describes the genetic structure
// DNA consists of a dictionary of phenotypes, where the value
// of each field is a value or an array

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
};

// Mutation
// A mutation can do two things:
//   1. it can alter a single value of a genotype
//   2. it can add a new value to a genotype

// Phenotype Expression (when a genotype is an array)
// Should a phenotype result from the average of the genotypes it has on any given step?
// Or should each step pick a random value from the genotypes it has?

// Sexual Reproduction???? Let' stick with asexual reproduction for now
// How do organisms pick a mate?
// How do the genes mix?


