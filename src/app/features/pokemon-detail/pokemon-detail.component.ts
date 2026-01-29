import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PokemonService, Pokemon } from '../../core/services/pokemon.service';
import { forkJoin } from 'rxjs';

interface EvolutionStep {
  name: string;
  image: string;
  min_level?: number;
  trigger?: string;
  item?: string;
}

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.css'
})
export class PokemonDetailComponent implements OnInit {
  pokemon: Pokemon | null = null;
  loading = true;
  error: string | null = null;

  // Evolutions
  prevEvolution: EvolutionStep | null = null;
  nextEvolutions: EvolutionStep[] = [];
  evoLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
    private pokemonService: PokemonService,
    private dialogRef: MatDialogRef<PokemonDetailComponent>
  ) { }

  /**
   * Inicializa el componente obteniendo detalles para el Pokemon solicitado.
   * También orquesta la carga de descripciones de habilidades.
   */
  ngOnInit(): void {
    if (this.data.name) {
      this.loadPokemon(this.data.name);
    }
  }

  loadPokemon(name: string): void {
    this.loading = true;
    this.error = null;
    this.pokemon = null;

    this.pokemonService.getPokemonByName(name).subscribe({
      next: (p) => {
        this.pokemon = p;
        this.loadAbilityDescriptions();
        this.loadEvolutions();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = `No existe el pokemon "${name}"`;
      }
    });
  }

  /**
   * Obtiene descripciones para todas las habilidades del Pokemon actual.
   * Espera hasta que todas estén cargadas antes de quitar el estado de carga.
   */
  loadAbilityDescriptions(): void {
    if (!this.pokemon) return;

    // Solo cargar si falta la descripción
    const requests = this.pokemon.abilities
      .filter(a => !a.description)
      .map(a => this.pokemonService.getAbilityDescription(a.name));

    if (requests.length === 0) {
      this.loading = false;
      return;
    }

    forkJoin(requests).subscribe({
      next: (results) => {
        let index = 0;
        this.pokemon!.abilities.forEach(a => {
          if (!a.description) {
            const data = results[index++];
            a.name = data.name; // Actualizar con nombre en español
            a.description = data.description;
          }
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadEvolutions(): void {
    if (!this.pokemon) return;
    this.evoLoading = true;
    this.prevEvolution = null;
    this.nextEvolutions = [];

    this.pokemonService.getPokemonSpecies(this.pokemon.name).subscribe({
      next: (species) => {
        this.pokemonService.getEvolutionChain(species.evolution_chain.url).subscribe({
          next: (chain) => {
            this.parseEvolutionChain(chain.chain);
            this.evoLoading = false;
          },
          error: () => this.evoLoading = false
        });
      },
      error: () => this.evoLoading = false
    });
  }

  parseEvolutionChain(chain: any): void {
    // Traverse recursively to find current pokemon
    const traverse = (node: any, parent: any | null) => {
      const nodeName = node.species.name;

      if (nodeName.toLowerCase() === this.pokemon?.name.toLowerCase()) {
        // Found current!

        // 1. Get Prev (Parent)
        if (parent) {
          this.prevEvolution = {
            name: parent.species.name,
            image: this.getPokemonImage(parent.species.url),
            min_level: node.evolution_details[0]?.min_level,
            trigger: node.evolution_details[0]?.trigger?.name,
            item: node.evolution_details[0]?.item?.name
          };
        }

        // 2. Get Next (Children)
        if (node.evolves_to && node.evolves_to.length > 0) {
          this.nextEvolutions = node.evolves_to.map((child: any) => ({
            name: child.species.name,
            image: this.getPokemonImage(child.species.url),
            min_level: child.evolution_details[0]?.min_level,
            trigger: child.evolution_details[0]?.trigger?.name,
            item: child.evolution_details[0]?.item?.name
          }));
        }
        return;
      }

      // Continue searching in children
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((child: any) => traverse(child, node));
      }
    };

    traverse(chain, null);
  }

  getPokemonImage(url: string): string {
    const id = url.split('/').filter(part => !!part).pop();
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  navigateToPokemon(name: string): void {
    // Reload current component logic or close/open? 
    // Simplest: Close and let list open new one? No, bad UX.
    // Better: Call loadPokemon logic again within same dialog.
    this.loadPokemon(name);
  }

  /**
   * Helper para obtener el color del tipo de Pokemon para chips de UI.
   */
  getTypeColor(type: string): string {
    return this.pokemonService.getTypeColor(type);
  }

  /**
   * Helper para determinar el color del texto (negro/blanco) basado en el brillo del fondo.
   */
  getTextColor(type: string): string {
    const bgColor = this.getTypeColor(type);
    return this.pokemonService.isLightColor(bgColor) ? '#333' : '#fff';
  }
}
