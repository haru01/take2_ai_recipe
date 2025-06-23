import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController';
import { recipeGenerationLimiter, validateContentType, validateRequestSize } from '../middleware/validation';

const router = Router();
const recipeController = new RecipeController();

router.post('/generate', 
  recipeGenerationLimiter, 
  validateContentType, 
  validateRequestSize, 
  recipeController.generateRecipes
);
router.get('/:id', recipeController.getRecipeDetail);

export default router;