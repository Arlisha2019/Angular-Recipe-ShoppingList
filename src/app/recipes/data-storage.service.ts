import { map, tap, take, exhaustMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root'})

export class DataStorageService {
    constructor(private http: HttpClient,
                private receipeService: RecipeService,
                private authService: AuthService) {}

    storeRecipes() {
        const recipes = this.receipeService.getRecipe();
        this.http.put('https://food-recipe-foodlist.firebaseio.com/recipes.json',
        recipes)
        .subscribe(response => {
            console.log(response);
        })
    }

    fetchRecipes() {
      
        return this.http
        .get<Recipe[]>('https://food-recipe-foodlist.firebaseio.com/recipes.json'
        ).pipe(
        map(receipes => {
            return receipes.map(recipe => {
                return {
                    ...recipe, 
                    ingredients: recipe.ingredients ? recipe.ingredients : []
                };
            });
        }),
        tap(recipes => {
            this.receipeService.setRecipes(recipes);
        })
      )
    };
       
}