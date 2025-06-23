import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface ICookingStep {
  stepNumber: number;
  instruction: string;
  duration?: number;
  temperature?: string;
  tips?: string;
}

export interface INutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface IRecipe extends Document {
  agentType: 'classic' | 'fusion' | 'healthy';
  title: string;
  description: string;
  cookingTime: number;
  prepTime: number;
  totalTime: number;
  servings: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  mainIngredients: string[];
  ingredients: IIngredient[];
  steps: ICookingStep[];
  features: string[];
  tips: string[];
  nutritionInfo: INutritionInfo;
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  amount: { type: String, required: true },
  unit: { type: String, default: '' },
  notes: { type: String },
});

const CookingStepSchema = new Schema<ICookingStep>({
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true },
  duration: { type: Number },
  temperature: { type: String },
  tips: { type: String },
});

const NutritionInfoSchema = new Schema<INutritionInfo>({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  fiber: { type: Number, required: true },
  sodium: { type: Number, required: true },
});

const RecipeSchema = new Schema<IRecipe>({
  _id: {
    type: String,
    required: true,
  },
  agentType: {
    type: String,
    enum: ['classic', 'fusion', 'healthy'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  cookingTime: { type: Number, required: true },
  prepTime: { type: Number, required: true },
  totalTime: { type: Number, required: true },
  servings: { type: Number, required: true, default: 4 },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  mainIngredients: [{ type: String, required: true }],
  ingredients: [IngredientSchema],
  steps: [CookingStepSchema],
  features: [{ type: String }],
  tips: [{ type: String }],
  nutritionInfo: NutritionInfoSchema,
  imageUrl: { type: String },
  tags: [{ type: String }],
}, {
  timestamps: true,
});

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);