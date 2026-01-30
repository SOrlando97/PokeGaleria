import { Routes } from '@angular/router';
import { PokemonListComponent } from './features/pokemon-list/pokemon-list.component';
import { DemoComponenteComponent } from './features/demo-componente/demo-componente.component';

export const routes: Routes = [
    // Ruta de demostración de componentes
    { path: 'demo', component: DemoComponenteComponent },
    // Tanto la raíz como /pokemon/:name cargan el mismo componente.
    // El componente maneja la apertura del diálogo basado en el parámetro.
    { path: '', component: PokemonListComponent },
    { path: 'pokemon/:name', component: PokemonListComponent },
    // Ruta comodín para 404s
    { path: '**', redirectTo: '' }
];
