import AddClientDetailsModal from "@/components/modals/AddClientDetailsModal";
import AddClientModal from "@/components/modals/AddClientModal";
// import AddRecipeModal from "@/components/modals/AddRecipeModal";
import AssignWorkoutModal from "@/components/modals/AssignModal";
import AssignWorkoutAddModal from "@/components/modals/AssignModeladd";
import AssignNewAppointmentModal from "@/components/modals/AssignNewAppointmentModal";
import BrandingModal from "@/components/modals/BrandingModal";
import ClientCreatedNotiModal from "@/components/modals/ClientCreatedNotiModals";
import AddSelectClientModal from "@/components/modals/clientmodal";
import CreateMealModal from "@/components/modals/AddRecipe";
import NewAppointmentModal from "@/components/modals/NewAppointmentModal";
import NewNotesModal from "@/components/modals/NewNotesAdd";
// import NewRecipeModal from "@/components/modals/RecipeModal";
import OrderSuccessModal from "@/components/modals/ordersuccessmodal";
import ProgramModal from "@/components/modals/PorgramModal";
// import AddPostModal from "@/components/modals/postmodal";
import AddPostModalVideo from "@/components/modals/postmodalvideo";

import ProfileModal from "@/components/modals/ProfileModal";
import RecipieSuccessModal from "@/components/modals/recipiesuccessfullmodel";
import SelectClientModal from "@/components/modals/SelectClientModal";
import SelectLanguageModal from "@/components/modals/SelectLanguageModal";
import ShoppingCartModal from "@/components/modals/shoppingcartmodel";

export default function Page() {
  return <div className="p-20 grid grid-cols-8 items-center gap-2">
    <ShoppingCartModal />
    <OrderSuccessModal />
    <AddSelectClientModal />
    <AssignWorkoutModal type="normal" />
    <AssignWorkoutAddModal />
    <RecipieSuccessModal />
    {/* <NewRecipeModal /> */}
    {/* <CreateMealModal /> */}
    {/* <AddRecipeModal /> */}
  </div>
}
