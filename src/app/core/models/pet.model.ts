export type PetKind = 'dog' | 'cat';

export interface Pet {
  /** Pet identity */
  id: number;

  /** Pet name */
  name: string;

  /** Pet type */
  kind: PetKind;

  /** Pet weight */
  weight: number;

  /** Pet height (centimeters) */
  height: number;

  /** Pet length (centimeters) */
  length: number;

  /** Pet image */
  photo_url: string;

  /** Pet description */
  description: string;

  /** Number of lives (Cats) */
  number_of_lives?: number;
}
