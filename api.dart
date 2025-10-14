class AppUrl {
  //   BASE URLS
  //   static const String baseUrl = "https://www.wellnessz.in";
  //   static const String baseUrl = "https://wellnessz-backend-one.vercel.app";
  //   static const String baseUrl = "http://51.21.57.22";
  static const String baseUrl = "https://api.wellnessz.in";
  //   static const String baseUrl = "https://stage.wellnessz.in";
  // static const String baseUrl = "http://192.168.29.34:8080";
  static const String baseUrlSocket = "https://chat-backend.wellnessz.in";
  // static const String baseUrlSocket = "http://10.0.2.2:8081"; 

  


  //Client Routes
  static const String signInClientCode = "/api/app/clientLogin"; // done
  static const String clientProfile = "/api/app/clientProfile"; // done
  static const String viewClient = "/api/app/viewClient"; //done
  static const String clientStatsCoach = "/api/app/clientStatsCoach"; //done
  static const String updateFollowUp = "/api/app/updateHealthMatrix"; //done
  static const String syncClientsAppToClub =
      "api/sync-clients--app-to-club"; //done

  static const String updateClientActiveStatus =
      "/api/app/updateClientActiveStatus"; // done
  static const String allClients = "/api/app/allClient"; // done
  static const String getAllChatClients = "/api/app/getAllChatClients"; // done
  static const String updateClient = "/api/app/updateClient"; //done
  static const String requestCheckup = "/api/app/requestCheckup"; //done
  static const String addClient = "/api/app/createClient"; //done
  static const String doFollowUp = "/api/app/add-followup"; //done
  static const String requestClient = "/api/app/request-client"; //done
  static const String requestClientProfileEdit =
      "/api/app/request-client-profile-edit"; // done
  static const String clientHomeAPI = "/api/app/clientHome"; // done
  static const String clientStats = "/api/app/clientStats"; // done
  static const String clientCoach = "/api/app/coachProfileForClient"; // done
  static const String requestFollowUpRequest =
      "/api/app/requestFollowUpRequest";

  //Coach Routes
  static const String updateCoach = "/api/app/updateCoach"; //done
  static const String updateClientOwn = "/api/app/updateClientOwn"; //done
  static const String getCoachProfile = "/api/app/coachProfile"; // done
  static const String getCoachHome =
      "/api/app/coachHome"; // will update optimised
  static const String getCoachHomeNew =
      "/api/app/coachHomeTrial"; // will update optimised
  static const String signInMobile =
      "/api/app/signin?authMode=mob"; // will update otimpised
  static const String signInGoogle =
      "/api/app/signin?authMode=g-auth"; // will update optimised
  static const String verifyOtp = "/api/app/verifyOtp"; //done
  static const String coachRegistration = "/api/app/register"; //done
  static const String updateCoachProfile = "/api/app/updateCoachProfile"; //done
  static const String requestReview = "/api/app/requestReview"; //done
  static const String updateFCMToken = "/api/app/updateFcmToken"; //done
  static const String deleteClient = "/api/app/deleteClient?id="; //done
  static const String deleteOrder = "/api/app/delete-order?id="; //done
  static const String deleteAward = "/api/app/deleteAward";
  static const String clientActivity = "/api/app/client-activity/add";
  static const String coachActivity = "/api/app/coach-activity/add";
  static const String getActivity = "/api/app/activity/get";
  static const String uploadFile = "/api/app/uploadFile";

  //Coach Subscription Routes
  static const String addSubscription = "/api/app/addSubscription";
  static const String updateSubscription = "/api/app/updateSubscription";
  static const String viewSubscription = "/api/app/viewSubscription";
  static const String extendSubscription = "/api/app/extendSubscription";
  static const String viewHistory = "/api/app/allCoachSubscriptions";

  //Feedback Routes
  static const String postFeedback = "/api/app/add-feedback"; //done

  //Goal Routes
  static const String requestGoal = "/api/app/addGoal"; //done
  static const String editGoal = "/api/app/editGoal"; //done

  //Meal Routes
  static const String addMeals = "/api/app/add-meal"; // DONE
  static const String searchMeal = "/api/app/getMeal"; // DONE
  static const String requestMeal = "/api/app/request-meal"; // DONE
  static const String deleteMeal = "/api/app/delete-plan?planId="; // DONE

  //Notification Routes
  static const String sendNotifications = "/api/app/send-notification"; //DONE
  static const String getAllNotifications = "/api/app/notification"; // DONE

  //Order Routes
  static const String addClientOrder = "/api/app/addClientOrder"; //DONE
  static const String getCoachOrderHistory = "/api/app/order-history"; //DONE
  static const String getClientHistory =
      "/api/app/client-order-history"; //DONE   __>>>>>>>AUTHORIZATION EXPERIENCE ID>>>>><<<<
  static const String updateOrder = "/api/app/update-order"; //DONE
  static const String acceptOrder = "/api/app/accept-order"; //DONE

  //Organisation Routes
  static const String getOrganisations =
      "/api/app/getOrganisation?search="; //DONE

  //Notes Routes
  static const String notes = "/api/app/notes"; //DONE

  //Plan Routes
  static const String getPlans = "/api/app/plans"; //DONE
  static const String assignPlan = "/api/app/assign-plan"; //DONE
  static const String createPlan = "/api/app/create-plan"; //DONE
  static const String getDetailPlan =
      "/api/app/get-plan-by-id"; //DONE--> NO AUTHORIZATION
  static const String getPlanImageLink = "/api/app/getPlanImage"; //DONE
  static const String updatePlan = "/api/app/update-plan"; //DONE
  static const String allMealClients = "/api/app/getClientForMeals"; //DONE
  static const String createCustomApp =
      "/api/app/create-plan-app?mode=CUSTOM"; //DONE
  static const String editPlan = "/api/app/editPlan";

  //Product Routes
  // static const String addProduct = "/api/app/addProduct"; //DONE
  static const String getRetailProducts = "/api/app/getProductByBrand"; //DONE

  //Reminder Routes
  static const String getReminders = "/api/app/getAllReminder"; //DONE
  static const String addReminders = "/api/app/addReminder?person=coach"; //DONE
  static const String updateReminders = '/api/app/update-reminder?id='; //DONE

  //Retail Routes
  static const String addClientOrderRequest =
      "/api/app/clientRetailRequest"; //DONE
  static const String profitAnalysis = "/api/app/data-analytics"; //DONE
  static const String coachRetailProfile = "/api/app/coach-retail"; //DONE

  //Social Routes
  static const String getSocialLinks = "/api/app/socialLinks"; //DONE

  //Story Routes
  static const String addStory = "/api/app/addStory"; //DONE
  static const String deleteStory = "/api/app/delete-story"; //DONE

  //Brand Routes
  static const String getRetailBrands = "/api/app/getBrand"; //DONE

  //Feed Routes
  static const String getAllCoachFeed = "/api/app/feeds2?person=coach"; //DONE
  static const String getAllClientFeed = "/api/app/feeds2?person=client"; //DONE
  static const String addFeed = "/api/app/addFeed"; //DONE
  // static const String postNewEdit = "/api/postNewEdit"; //DONE ---> NOT GETTING USED
  static const String deleteFeed = '/api/app/delete-feed?postId='; //DONE
  static const String getMyFeed = '/api/app/my-posts'; //DONE
  // static const String getFeedById = "/api/app/getFeedById/";//DONE ----> NOT GETTING USED
  static const String feedActivity = "/api/app/feedActivity"; //DONE
  static const String feedComments = "/api/app/get-comments?postId="; //DONE
  //User Routes

  // personal branding
  static const String addBranding = "/api/app/create";
  static const String getBranding = "/api/app/list";
  static const String updateBrand = "/api/app/update";

  // social links
  static const String addLinks = "/api/app/sm";
  static const String getLinks = "/api/app/sm";

  //Recipe Links

  static const String getRecipe = "/api/app/getRecipes";
  static const String addRecipe = "/api/app/addRecipes";
  static const String editRecipe = "/api/app/editRecipes";
  static const String deleteRecipe = "/api/app/deleteRecipes";
  static const String recipees = "/api/app/recipees";

  // Health Matrix Routes
  static const String healthMatrix = "/api/app/health-matrix";
}
