import { Routes } from '@angular/router';
import { PokemonListComponent } from './features/pokemon-list/pokemon-list.component';

export const routes: Routes = [
    // Tanto la raíz como /pokemon/:name cargan el mismo componente.
    // El componente maneja la apertura del diálogo basado en el parámetro.
    { path: '', component: PokemonListComponent },
    { path: 'pokemon/:name', component: PokemonListComponent },
    // Ruta comodín para 404s
    { path: '**', redirectTo: '' }
];
