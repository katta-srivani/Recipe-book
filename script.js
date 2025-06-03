document.addEventListener('DOMContentLoaded', function() {
    const recipeForm = document.getElementById('recipeForm');
    const recipesContainer = document.getElementById('recipesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
    
    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let editingId = null;

    // Display all recipes
    displayRecipes(recipes);

    // Form submission
    recipeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const recipeName = document.getElementById('recipeName').value;
        const recipeImage = document.getElementById('recipeImage').value;
        const recipePrepTime = document.getElementById('recipePrepTime').value;
        const recipeIngredients = document.getElementById('recipeIngredients').value;
        const recipeInstructions = document.getElementById('recipeInstructions').value;
        const recipeId = document.getElementById('recipeId').value;
        
        const ingredientsArray = recipeIngredients.split('\n').filter(ing => ing.trim() !== '');
        
        const recipe = {
            name: recipeName,
            image: recipeImage || 'https://via.placeholder.com/300x200?text=No+Image',
            prepTime: recipePrepTime,
            ingredients: ingredientsArray,
            instructions: recipeInstructions,
            id: recipeId || Date.now().toString()
        };
        
        if (editingId) {
            // Update existing recipe
            const index = recipes.findIndex(r => r.id === editingId);
            recipes[index] = recipe;
            editingId = null;
        } else {
            // Add new recipe
            recipes.push(recipe);
        }
        
        // Save to local storage
        localStorage.setItem('recipes', JSON.stringify(recipes));
        
        // Reset form
        recipeForm.reset();
        document.getElementById('recipeId').value = '';
        
        // Refresh display
        displayRecipes(recipes);
    });

    // Search functionality
    searchBtn.addEventListener('click', searchRecipes);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchRecipes();
        }
    });

    function searchRecipes() {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm.trim() === '') {
            displayRecipes(recipes);
            return;
        }
        
        const filteredRecipes = recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)) ||
            recipe.instructions.toLowerCase().includes(searchTerm) ||
            recipe.prepTime.toString().includes(searchTerm)
        );
        
        displayRecipes(filteredRecipes);
    }

    function displayRecipes(recipesToDisplay) {
        recipesContainer.innerHTML = '';
        
        if (recipesToDisplay.length === 0) {
            recipesContainer.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="bi bi-journal-x"></i>
                    <h4>No recipes found</h4>
                    <p>Add your first recipe using the form on the left</p>
                </div>
            `;
            return;
        }
        
        recipesToDisplay.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'col-md-6 col-lg-4';
            recipeCard.innerHTML = `
                <div class="card recipe-card">
                    ${recipe.image ? `<img src="${recipe.image}" class="card-img-top recipe-img" alt="${recipe.name}">` : ''}
                    <div class="card-body">
                        <h5 class="card-title">${recipe.name}</h5>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="badge bg-secondary">${recipe.ingredients.length} ingredients</span>
                            <span class="time-badge"><i class="bi bi-clock"></i> ${recipe.prepTime} mins</span>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary view-btn" data-id="${recipe.id}">View</button>
                            <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${recipe.id}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${recipe.id}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            recipesContainer.appendChild(recipeCard);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', viewRecipe);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editRecipe);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteRecipe);
        });
    }

    function viewRecipe(e) {
        const recipeId = e.target.getAttribute('data-id');
        const recipe = recipes.find(r => r.id === recipeId);
        
        document.getElementById('modalRecipeTitle').textContent = recipe.name;
        document.getElementById('modalRecipeImage').src = recipe.image;
        document.getElementById('modalPrepTime').innerHTML = `<i class="bi bi-clock"></i> ${recipe.prepTime} minutes`;
        
        const ingredientsList = document.getElementById('modalRecipeIngredients');
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing;
            ingredientsList.appendChild(li);
        });
        
        document.getElementById('modalRecipeInstructions').textContent = recipe.instructions;
        
        recipeModal.show();
    }

    function editRecipe(e) {
        const recipeId = e.target.getAttribute('data-id');
        const recipe = recipes.find(r => r.id === recipeId);
        
        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('recipeImage').value = recipe.image;
        document.getElementById('recipePrepTime').value = recipe.prepTime;
        document.getElementById('recipeIngredients').value = recipe.ingredients.join('\n');
        document.getElementById('recipeInstructions').value = recipe.instructions;
        document.getElementById('recipeId').value = recipe.id;
        
        editingId = recipe.id;
        
        // Scroll to form
        document.getElementById('recipeForm').scrollIntoView({ behavior: 'smooth' });
    }

    function deleteRecipe(e) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            const recipeId = e.target.getAttribute('data-id');
            recipes = recipes.filter(r => r.id !== recipeId);
            localStorage.setItem('recipes', JSON.stringify(recipes));
            displayRecipes(recipes);
        }
    }
});