import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RecipesService } from '../../../core/services/recipes.service';
import { RecipeCategory } from '../../../core/models/recipe.model';

@Component({
    selector: 'app-recipe-create-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './recipe-create-modal.component.html',
    styleUrls: ['./recipe-create-modal.component.scss']
})
export class RecipeCreateModalComponent {
    private fb = inject(FormBuilder);
    private recipesService = inject(RecipesService);

    @Output() close = new EventEmitter<void>();
    @Output() recipeCreated = new EventEmitter<void>();

    recipeForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        category: ['others', Validators.required],
        photo_url: ['', Validators.required],
        ingredients: ['', Validators.required],
        instructions: this.fb.array([this.fb.control('', Validators.required)])
    });

    categories: RecipeCategory[] = ['dessert', 'fish', 'meat', 'legume', 'rice', 'vegetables', 'doughs', 'others', 'pasta'];

    get instructions() {
        return this.recipeForm.get('instructions') as FormArray;
    }

    addStep() {
        this.instructions.push(this.fb.control('', Validators.required));
    }

    removeStep(index: number) {
        if (this.instructions.length > 1) {
            this.instructions.removeAt(index);
        }
    }

    onStepInput(index: number) {
        // If the user typed in the last step, add a new one automatically
        if (index === this.instructions.length - 1 && this.instructions.at(index).value.trim() !== '') {
            this.addStep();
        }
    }

    onSubmit() {
        if (this.recipeForm.valid) {
            const formValue = this.recipeForm.value;

            // Transform steps array to a single string and provide default values
            // We filter out empty steps at the end (likely the one auto-added)
            const steps = (formValue.instructions as string[])
                .map(step => step.trim())
                .filter(step => step !== '');

            const recipeData = {
                ...formValue,
                description: '',
                difficulty: 'medium' as const,
                prepTime: 0,
                cookTime: 0,
                servings: 1,
                calories: 0,
                ingredients: formValue.ingredients.split('\n').filter((i: string) => i.trim() !== ''),
                instructions: steps.join('\n')
            };

            this.recipesService.createRecipe(recipeData).subscribe(result => {
                if (result) {
                    this.recipeCreated.emit();
                    this.onClose();
                }
            });
        } else {
            this.recipeForm.markAllAsTouched();
        }
    }

    onClose() {
        this.close.emit();
    }
}
