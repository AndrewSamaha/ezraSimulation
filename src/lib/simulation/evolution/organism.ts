// Define a genotype as an array of numbers that can be mutated
// Allele might be more accurate?
// Genes might be more accurate? Let's just think of this as a genotype

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
