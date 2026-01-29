import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { PokemonService, Pokemon } from '../../core/services/pokemon.service';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})
export class PokemonListComponent implements OnInit, OnDestroy {
  pokemons: Pokemon[] = [];
  loading = true;
  private routeSub: Subscription | null = null;
  private dialogRef: MatDialogRef<PokemonDetailComponent> | null = null;

  // Track current open dialog to avoid duplicates
  currentDialogName: string | null = null;

  constructor(
    private pokemonService: PokemonService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  /**
   * Inicializa el componente obteniendo Pokemons aleatorios.
   * También se suscribe a los parámetros de la ruta para manejar deep linking (abre el diálogo si la URL tiene nombre).
   */
  ngOnInit(): void {
    this.pokemonService.getRandomPokemons(30).subscribe({
      next: (data) => {
        this.pokemons = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los pokemons', err);
        this.loading = false;
      }
    });

    this.routeSub = this.route.paramMap.subscribe(params => {
      const name = params.get('name');
      if (name) {
        this.openDialog(name);
      } else {
        // Si estamos en la raíz y el diálogo está abierto, cerrarlo (ej: botón atrás)
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  /**
   * Abre el Diálogo de Detalle del Pokemon.
   * Actualiza el estado para prevenir diálogos duplicados.
   * @param name Nombre del Pokemon a mostrar
   */
  openDialog(name: string): void {
    // Si el diálogo ya está abierto para este nombre, no hacer nada
    if (this.currentDialogName === name) {
      return;
    }

    this.currentDialogName = name;
    this.dialogRef = this.dialog.open(PokemonDetailComponent, {
      width: '800px',
      maxHeight: '90vh', // Asegura que quepa en pantallas pequeñas
      data: { name },
      disableClose: false // permitir cerrar haciendo clic fuera
    });

    // Manejar el cierre del diálogo vía UI
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.currentDialogName = null;
      // Navegar/actualizar URL a la raíz si actualmente muestra un detalle
      if (this.route.snapshot.paramMap.has('name')) {
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Helper para obtener el color del tipo de Pokemon chips de UI.
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
