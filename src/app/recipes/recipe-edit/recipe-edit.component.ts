import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { RecipeService } from '../recipe.service';


@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  receipeForm: FormGroup;
  
  constructor(private route: ActivatedRoute,
              private receipeService: RecipeService,
              private router: Router) { }

  ngOnInit() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          this.initForm();
          console.log(this.editMode);
        }
      );
  }

  onCancel() {
    this.router.navigate(['../'],  {relativeTo: this.route});
  }

  onSubmit() {

    // const newRecipe = new Recipe(
    //   this.receipeForm.value['name'],
    //   this.receipeForm.value['description'],
    //   this.receipeForm.value['imagePath'],
    //   this.receipeForm.value['ingredients']);

    if(this.editMode) {
      this.receipeService.updateRecipe(this.id, this.receipeForm.value)
    } else {
      this.receipeService.addRecipe(this.receipeForm.value);
    }
    this.onCancel();
    console.log(this.receipeForm);
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.receipeForm.get('ingredient')).removeAt(index)
  }


  private initForm() {
    let receipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredient = new FormArray([]);

    if (this.editMode) {
      const receipe = this.receipeService.getRecipes(this.id);
      receipeName = receipe.name;
      recipeImagePath = receipe.imagePath;
      recipeDescription = receipe.description;
      if (receipe['ingredients']) {
        for( let ingredient of receipe.ingredients) {
          recipeIngredient.push(
            new FormGroup({
              'name': new FormControl(ingredient.name, Validators.required),
              'amount': new FormControl(ingredient.amount, [
                Validators.required,
                Validators.pattern(/^[1-9]+[0-9]*$/)
              ]),
              'description': new FormControl()
            })
          )
        }
      }
    }

    this.receipeForm = new FormGroup({
      'name': new FormControl(receipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredient': recipeIngredient
    });
  }

  getControls() {
    return (<FormArray>this.receipeForm.get('ingredient')).controls;
  }

  onAddIngredient() {
    (<FormArray>this.receipeForm.get('ingredient')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ])
      })
    )
  }

  get controls() {
    return (this.receipeForm.get('ingredient') as FormArray).controls;
  }

}
