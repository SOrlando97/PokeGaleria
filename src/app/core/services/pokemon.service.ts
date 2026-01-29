import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, tap } from 'rxjs';

export interface Ability {
  name: string;
  description?: string;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  abilities: Ability[];
  height: number;
  weight: number;
  backgroundStyle: string; // CSS background string
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private abilityUrl = 'https://pokeapi.co/api/v2/ability';
  private speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';

  // Cache para prevenir recargas en navegación
  private loadedPokemons: Pokemon[] = [];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista de Pokemons aleatorios únicos.
   * Verifica la caché local primero para evitar recargas al navegar.
   * @param count Número de Pokemons a obtener (por defecto 30)
   */
  getRandomPokemons(count: number = 30): Observable<Pokemon[]> {
    if (this.loadedPokemons.length >= count) {
      return of(this.loadedPokemons);
    }

    const randomIds = new Set<number>();
    while (randomIds.size < count) {
      randomIds.add(Math.floor(Math.random() * 1000) + 1);
    }

    const requests = Array.from(randomIds).map(id =>
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        map(response => this.transformPokemon(response))
      )
    );

    return forkJoin(requests).pipe(
      tap(pokemons => this.loadedPokemons = pokemons)
    );
  }

  /**
   * Obtiene los detalles de un Pokemon específico por nombre.
   * Usa la caché si está disponible.
   * @param name Nombre del Pokemon
   */
  getPokemonByName(name: string): Observable<Pokemon> {
    const cached = this.loadedPokemons.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (cached) {
      // Retornar versión en caché si existe
      return of(cached);
    }

    return this.http.get<any>(`${this.apiUrl}/${name.toLowerCase()}`).pipe(
      map(response => this.transformPokemon(response))
    );
  }

  /**
   * Obtiene el nombre y descripción de una habilidad en español.
   * Busca primero en 'flavor_text_entries' para español, si no falla a inglés.
   * También busca el nombre traducido.
   * @param abilityName Nombre técnico de la habilidad
   */
  getAbilityDescription(abilityName: string): Observable<{ name: string, description: string }> {
    return this.http.get<any>(`${this.abilityUrl}/${abilityName.toLowerCase()}`).pipe(
      map(response => {
        // 1. Buscar nombre en español
        const nameEntry = response.names.find((n: any) => n.language.name === 'es');
        const translatedName = nameEntry ? nameEntry.name : abilityName;

        // 2. Buscar descripción en español
        let description = 'Descripción no disponible';
        const flavorEntry = response.flavor_text_entries.find((f: any) => f.language.name === 'es');

        if (flavorEntry) {
          description = flavorEntry.flavor_text;
        } else {
          // Fallback a inglés (flavor o effect)
          const flavorEn = response.flavor_text_entries.find((f: any) => f.language.name === 'en');
          const effectEn = response.effect_entries.find((e: any) => e.language.name === 'en');
          description = flavorEn ? flavorEn.flavor_text : (effectEn ? (effectEn.short_effect || effectEn.effect) : description);
        }

        // Limpiar saltos de línea de la API
        description = description.replace(/[\r\n\f]/g, ' ');

        return { name: translatedName, description };
      })
    );
  }

  /**
   * Obtiene la especie del Pokemon, que contiene la URL de la cadena de evolución.
   * @param name Nombre del Pokemon
   */
  getPokemonSpecies(name: string): Observable<any> {
    return this.http.get<any>(`${this.speciesUrl}/${name.toLowerCase()}`);
  }

  /**
   * Obtiene la cadena de evolución completa desde una URL.
   * @param url URL de la cadena de evolución
   */
  getEvolutionChain(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  /**
   * Transforma los datos crudos de la API en nuestra interfaz interna Pokemon.
   * Calcula los estilos de fondo basados en los tipos.
   */
  private transformPokemon(data: any): Pokemon {
    const types = data.types.map((t: any) => t.type.name);
    return {
      id: data.id,
      name: this.capitalize(data.name),
      image: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
      types: types,
      abilities: data.abilities.map((a: any) => ({ name: a.ability.name })),
      height: data.height,
      weight: data.weight,
      backgroundStyle: this.getTypeBackground(types)
    };
  }

  /**
   * Capitaliza la primera letra de una cadena.
   */
  private capitalize(s: string): string {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /**
   * Retorna el color oficial asociado a un tipo de Pokemon.
   */
  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      normal: '#A8A77A',
      fire: '#EE8130',
      water: '#6390F0',
      electric: '#F7D02C',
      grass: '#7AC74C',
      ice: '#96D9D6',
      fighting: '#C22E28',
      poison: '#A33EA1',
      ground: '#E2BF65',
      flying: '#A98FF3',
      psychic: '#F95587',
      bug: '#A6B91A',
      rock: '#B6A136',
      ghost: '#735797',
      dragon: '#6F35FC',
      dark: '#705746',
      steel: '#B7B7CE',
      fairy: '#D685AD'
    };
    return colors[type.toLowerCase()] || '#A8A77A';
  }

  /**
   * Determina si un color es claro u oscuro para ajustar el contraste del texto.
   * Retorna true si el color es claro (requiere texto oscuro).
   */
  isLightColor(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128;
  }

  /**
   * Genera un fondo con degradado lineal CSS basado en los tipos del Pokemon.
   */
  private getTypeBackground(types: string[]): string {
    if (types.length === 0) return '#f0f0f0'; // default

    const type1Color = this.getTypeColor(types[0]);

    if (types.length === 1) {
      return `linear-gradient(135deg, ${type1Color} 0%, ${this.lighten(type1Color, 20)} 100%)`;
    }

    const type2Color = this.getTypeColor(types[1]);
    return `linear-gradient(135deg, ${type1Color} 0%, ${type2Color} 100%)`;
  }

  /**
   * Helper para aclarar un color hexadecimal para degradados de un solo tipo.
   */
  private lighten(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}
