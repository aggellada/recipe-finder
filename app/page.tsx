"use client";

import {
  Bookmark,
  CircleMinus,
  CirclePlus,
  MoveLeft,
  MoveRight,
  Save,
  Search,
  SquareX,
  Timer,
  Trash,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Recipe = {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
};

type Ingredient = {
  quantity: number | null;
  unit: string;
  description: string;
};

type SpecificRecipe = {
  cooking_time: number;
  id: string;
  image_url: string;
  ingredients: Ingredient[];
  publisher: string;
  servings: number;
  source_url: string;
  title: string;
};

export default function Home() {
  // ------------------ STATES ------------------
  const [foodRecipes, setFoodRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<SpecificRecipe | null>(
    null
  );
  const [search, setSearch] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(1);
  const [openBookmarks, setOpenBookmarks] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(3);

  const [savedRecipes, setSavedRecipes] = useState<SpecificRecipe[]>([]);

  // ------------------ REFS ------------------
  const searchRef = useRef<HTMLInputElement>(null);
  const bookmarkRef = useRef<HTMLDialogElement>(null);
  const alertRef = useRef<HTMLDialogElement>(null);

  // ------------------ CONSTS ------------------
  const postsPerPage = 5;
  const lastRecipeIndex = currentPage * postsPerPage;
  const firstRecipeIndex = lastRecipeIndex - postsPerPage;
  const currentPost = foodRecipes
    ? foodRecipes.slice(firstRecipeIndex, lastRecipeIndex)
    : null;
  const foodLength = Math.round(foodRecipes.length / postsPerPage);

  // ------------------ USEEFFECTS ------------------
  useEffect(() => {
    const searchRecipe = async () => {
      try {
        const response = await fetch(
          `https://forkify-api.herokuapp.com/api/v2/recipes?search=${search}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Could not fetch the data.");
        }

        setFoodRecipes(data.data.recipes);
      } catch (error) {
        throw error;
      }
    };
    searchRecipe();
  }, [search]);

  useEffect(() => {
    if (openBookmarks) {
      bookmarkRef.current?.showModal();
    } else {
      bookmarkRef.current?.close();
    }
  }, [openBookmarks]);

  useEffect(() => {
    if (showAlert) {
      alertRef.current?.showModal();
      const alertAutoClose = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      const closeTimer = setInterval(() => {
        setTimer((prev) => {
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(closeTimer);
        clearTimeout(alertAutoClose);
      };
    } else {
      alertRef.current?.close();
      setTimer(3);
    }
  }, [showAlert]);

  // ------------------ UI INTERACTION ------------------
  const searchRecipe = () => {
    setSearch(searchRef.current?.value || "");
  };

  const selectedRecipeClick = async (foodItem: any) => {
    try {
      const response = await fetch(
        `https://forkify-api.herokuapp.com/api/v2/recipes/${foodItem.id}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Could not fetch data.");
      }
      setSelectedRecipe(data.data.recipe);
    } catch (err) {
      throw err;
    }
  };

  const clickBookmarkedRecipe = async (foodItem: any) => {
    selectedRecipeClick(foodItem);
    clickCloseBookmarks();
  };

  const nextPage = () => {
    if (currentPage === foodLength) return;
    setCurrentPage((prev) => prev + 1);
  };

  const previousPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const addServing = () => {
    setServingsMultiplier((prev) => prev + 1);
  };

  const subtractServing = () => {
    if (servingsMultiplier === 1) return;
    setServingsMultiplier((prev) => prev - 1);
  };

  const clickOpenBookmarks = () => {
    setOpenBookmarks(true);
  };

  const clickCloseBookmarks = () => {
    setOpenBookmarks(false);
  };

  const saveRecipe = (recipe: SpecificRecipe) => {
    if (savedRecipes.includes(recipe)) return;

    setSavedRecipes((prev) => {
      return [...prev, recipe];
    });

    setShowAlert(true);
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  const deleteBookmarkRecipe = (recipeToDelete: SpecificRecipe) => {
    setSavedRecipes((prev) => {
      return prev.filter((recipe) => recipe != recipeToDelete);
    });
  };

  return (
    <>
      {alertRef && (
        <dialog
          ref={alertRef}
          onClose={closeAlert}
          className="m-auto w-1/5 h-1/5 rounded-2xl"
        >
          <div className="flex w-full h-full justify-center items-center flex-col gap-2">
            <h1 className="font-bold text-xl">Successfully saved a recipe!</h1>
            <h2 className="font-extralight text-sm">
              Window will close in {timer}
            </h2>
            <button
              onClick={closeAlert}
              className="py-1 p-4 bg-red-500 text-white rounded-full hover:cursor-pointer"
            >
              Close
            </button>
          </div>
        </dialog>
      )}
      {openBookmarks && (
        <dialog
          ref={bookmarkRef}
          onClose={clickCloseBookmarks}
          className="m-auto w-2/5 h-2/4 p-12 relative rounded-2xl"
        >
          <button className="absolute top-4 right-4">
            <SquareX
              onClick={clickCloseBookmarks}
              className="hover:cursor-pointer hover:text-red-600 transition ease-in"
            />
          </button>
          <h1 className="border-b-2 border-gray-600 font-bold text-3xl mb-4">
            Bookmarks
          </h1>
          {savedRecipes.length === 0 && <h1>No saved bookmarks yet.</h1>}
          <div className="w-full flex gap-4 flex-col">
            {savedRecipes &&
              savedRecipes.map((recipe) => {
                return (
                  <div
                    className="w-full flex justify-between hover:cursor-pointer hover:bg-zinc-300"
                    onClick={() => clickBookmarkedRecipe(recipe)}
                    key={recipe.id}
                  >
                    <div className="">
                      <h1 className="font-medium text-md">{recipe.title}</h1>
                      <h1 className="font-light text-sm">
                        by: {recipe.publisher}
                      </h1>
                    </div>
                    <button
                      className=" hover:cursor-pointer hover:text-red-600 transition ease-in p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBookmarkRecipe(recipe);
                      }}
                    >
                      <Trash />
                    </button>
                  </div>
                );
              })}
          </div>
        </dialog>
      )}

      <div className="w-full h-screen bg-gradient-to-r from-red-500 to-yellow-500 flex justify-center md:pt-12">
        <div className="w-full h-full md:w-[80vw] md:h-[80vh] bg-gray-400 md:rounded-4xl">
          <div className="flex w-full h-[60px] bg-gray-200 md:rounded-t-4xl  justify-around items-center border-b-2 border-b-gray-900">
            <div className="h-full flex items-center gap-2 md:gap-4">
              <img
                src="https://cdn2.iconfinder.com/data/icons/cooking-58/64/30-cook_book-recipe_book-recipe-ingredients-kitchen-book-256.png"
                alt="recipe finder logo"
                className="w-[40px] h-[50px] md:w-[60px] md:h-full py-2"
              />
              <h1 className="text-sm md:text-xl">Recipe Finder</h1>
            </div>
            <div className="h-full flex items-center gap-1 md:gap-4">
              <input
                type="text"
                ref={searchRef}
                className="bg-white w-[150px] md:w-[250px] md:px-2 text-sm md:text-md md:py-1 border-2 border-gray-500 rounded-2xl"
                placeholder="Search over 1,000,000 recipes..."
              />
              <button
                onClick={searchRecipe}
                className="hidden md:block py-1 px-2 md:px-4 text-sm md:text-md bg-red-500 rounded-3xl hover:cursor-pointer hover:text-zinc-100"
              >
                Search
              </button>
              <Search className="md:hidden" onClick={searchRecipe} />
            </div>
            <div className="h-full flex items-center gap-4">
              <Bookmark
                className="hover:cursor-pointer hover:text-blue-600 transition ease-in"
                onClick={clickOpenBookmarks}
              />
            </div>
          </div>
          <div className="w-full h-full flex md:text-sm ">
            <div className=" h-full grow flex flex-col justify-between bg-zinc-300 w-2/6 lg:w-1/4 md:rounded-bl-4xl border-r-2 border-gray-800">
              {foodRecipes.length > 0 &&
                currentPost?.map((food) => {
                  return (
                    <div
                      className="flex gap-2 grow items-center px-1 md:px-3 hover:bg-zinc-400 hover:cursor-pointer"
                      onClick={() => selectedRecipeClick(food)}
                      key={food.id}
                    >
                      <img
                        src={food.image_url}
                        alt={food.title}
                        className="w-1/4 h-[60px] rounded-full"
                      />
                      <div className="w-3/4">
                        <h1 className="test-sm font-light md:font-medium md:text-md">
                          {food.title}
                        </h1>
                        <h1 className="hidden md:block font-light text-sm">
                          by: {food.publisher}
                        </h1>
                      </div>
                    </div>
                  );
                })}
              {search && (
                <div className="w-full h-[70px] bg-zinc-300  flex justify-center items-center gap-2 md:gap-8 rounded-bl-4xl">
                  {currentPage === 1 ? (
                    ""
                  ) : (
                    <button
                      onClick={previousPage}
                      className="hover:cursor-pointer"
                    >
                      <MoveLeft />
                    </button>
                  )}
                  <h1>
                    {currentPage}/{foodLength}
                  </h1>
                  {currentPage === foodLength ? (
                    ""
                  ) : (
                    <button onClick={nextPage} className="hover:cursor-pointer">
                      <MoveRight />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex w-3/4 h-full bg-gray-200 flex-col md:text-sm md:rounded-br-4xl">
              {selectedRecipe && (
                <div className="w-full h-full bg-blue-200 flex flex-col md:rounded-b-4xl">
                  <div className="w-full h-[200px] bg-violet-400 flex items-center justify-center relative">
                    {selectedRecipe && (
                      <h1 className="z-10 p-2 text-center rounded-2xl text-xl lg:text-3xl font-bold bg-[rgba(255,69,0,0.7)]">
                        {selectedRecipe.title}
                      </h1>
                    )}
                    {selectedRecipe && (
                      <img
                        src={selectedRecipe.image_url}
                        className="w-full h-full object-cover absolute"
                      />
                    )}
                  </div>
                  <div className="w-full flex justify-around items-center h-[40px] lg:h-[80px] bg-zinc-300 border-t-2 border-b-2 border-gray-800">
                    <div className="flex items-center gap-1 md:gap-4 text-xs text-center">
                      <Timer />
                      <h1 className="flex gap-2">
                        {selectedRecipe?.cooking_time} MINUTES
                      </h1>
                    </div>
                    <div className="flex items-center gap-1 md:gap-4 text-xs text-center">
                      <Users />
                      {selectedRecipe && (
                        <h1 className="flex gap-2">
                          {servingsMultiplier * selectedRecipe?.servings}{" "}
                          SERVINGS
                        </h1>
                      )}
                      <button onClick={subtractServing}>
                        <CircleMinus className="hover:cursor-pointer hover:text-red-500 transition ease-in" />
                      </button>
                      <button onClick={addServing}>
                        <CirclePlus className="hover:cursor-pointer hover:text-green-500 transition ease-in" />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <Save
                        onClick={() => saveRecipe(selectedRecipe)}
                        className="hover:cursor-pointer hover:text-green-600 transition ease-in"
                      />
                    </div>
                  </div>
                  <div className="w-full grow flex bg-gray-200 p-2 lg:p-6 rounded-br-4xl">
                    <div className="w-full h-full grid grid-cols-2">
                      {selectedRecipe &&
                        selectedRecipe.ingredients.map((ingredient, index) => (
                          <div
                            className="w-full flex text-sm md:text-md lg:text-lg md:gap-2 justify-center"
                            key={index}
                          >
                            <h4>
                              {ingredient.quantity != null
                                ? ingredient.quantity * servingsMultiplier
                                : ""}
                            </h4>
                            <h4>{ingredient.unit}</h4>
                            <h4>{ingredient.description}</h4>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
