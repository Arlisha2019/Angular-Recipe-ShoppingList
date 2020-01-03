import { Recipe } from './recipe.model';
import { EventEmitter, Injectable } from '@angular/core';
import { Ingredient } from '../shared/ingredient.modal';
import { ShoppingListService } from '../shopping/shoppingList.service';
import { Subject } from 'rxjs';




@Injectable()
export class RecipeService {

  receipeChanged = new Subject<Recipe[]>();
   
    // private recipes: Recipe[] = [
    //     new Recipe('Red Velvet Cake', 'This is so Delis....', 'https://www.jocooks.com/wp-content/uploads/2016/02/red-velvet-cake-1-2.jpg',
    //     [
    //         new Ingredient('Flour', 5),
    //         new Ingredient('Sugar', 3)
    //     ]),
    //     new Recipe('Fried Chicken Wings', 'So Good.....', 'https://live.staticflickr.com/4045/4695061960_9c01e71717_b.jpg',
    //     [
    //         new Ingredient('Flour', 5),
    //         new Ingredient('Sugar', 3)
    //     ]),
    //   ];

    private recipes: Recipe[] = [];

    constructor(private shoppingListService: ShoppingListService) {}

      setRecipes(recipes: Recipe[]) {
        this.recipes = recipes;
        this.receipeChanged.next(this.recipes.slice());

      }

      getRecipe() {
          return this.recipes.slice();
      }

      getRecipes(index: number) {
        return this.recipes[index];
      }

      addIngredientsToShoppingList(ingredients: Ingredient[]) {
        this.shoppingListService.addIngredients(ingredients);
      }
      addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.receipeChanged.next(this.recipes.slice());
      }

      updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.receipeChanged.next(this.recipes.slice());
      }

      deleteRecipe(index: number) {
        this.recipes.splice(index, 1);
        this.receipeChanged.next(this.recipes.slice());
      }
}