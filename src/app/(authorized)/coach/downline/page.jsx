"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials } from "@/lib/formatter";
import { useState } from "react";
import FormControl from "@/components/FormControl";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData, fetchData } from "@/lib/api";
import { toast } from "sonner";
import { useAppSelector } from "@/providers/global/hooks";
import ContentError from "@/components/common/ContentError";
import useSWR, { mutate } from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import {
	retrieveClientList,
	retrieveDownlineCoaches,
	retrieveDownlineRequests,
} from "@/lib/fetchers/app";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TreeVisualizer from "@/components/pages/coach/downline/Visualizer";
import HierarchicalCoachTable from "@/components/pages/coach/downline/HierarchicalCoachTable";
import { PlusCircle, Edit, Trash2, Eye, ChevronDown, MoreVertical, Plus, FileSpreadsheet, Check, Cog, FilterX, SlidersHorizontal, X, Funnel } from "lucide-react";
import { ManageCategoryModal } from "@/components/modals/coach/ManageCategoryModal";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTabsContentNavigation } from "@/hooks/useTabsContentNavigation";
import { SyncedCoachClientDetails } from "@/components/modals/coach/SyncedCoachesModal";
import { cn, copyText } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteClientModal from "@/components/modals/client/DeleteClientModal";
import ClientUpdateCategories from "@/components/pages/coach/client/ClientUpdateCategories";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Loader from "@/components/common/Loader";
import { exportToExcel } from "@/lib/excel";
import { calculateCurrentSubscriptions, getClusterSubscriptions } from "@/lib/downline";
import SelectMultiple from "@/components/SelectMultiple";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const categoriesFetcher = () =>
	fetchData("app/coach-categories").then((res) => {
		if (res.status_code !== 200) throw new Error(res.message);
		return res.data;
	});

export default function Page() {
	const { tabChange, selectedTab } = useTabsContentNavigation(
		"list",
		["list", "visualizer", "manageCategories", "clients"]
	);

	const { data: coachData } = useAppSelector((state) => state.coach);
	const { downline = {}, features, clubType } = coachData;

	const {
		data: categories,
		error: categoriesError,
		isLoading: categoriesLoading,
		mutate: mutateCategories,
	} = useSWR("coach-categories", categoriesFetcher);

	const handleDeleteCategory = async (setLoading, closeBtnRef, categoryId) => {
		setLoading(true);
		try {
			const response = await sendData(
				`app/coach-categories/${categoryId}`,
				{},
				"DELETE"
			);
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success("Category deleted successfully.");
			mutateCategories();
			closeBtnRef.current.click();
		} catch (err) {
			toast.error(err.message || "Failed to delete category.");
		} finally {
			setLoading(false);
		}
	};

	if (!features?.includes(5) && !["System Leader", "Club Leader", "Club Leader Jr", "Club Captain"].includes(clubType)) {
		return <ContentError title="This feature isn't enabled for you" />;
	}

	if (!["requested", "in-downline"].includes(downline?.status)) {
		return (
			<div className="content-height-screen content-container flex items-center justify-center">
				<StartDownline />
			</div>
		);
	}

	const initialNodeData = {
		id: coachData._id,
		label: nameInitials(coachData.name),
		categoryName: coachData.coachCategory?.name || "Uncategorized",
		title: `
            <div style="padding: 5px; color: #333;">
                <p style="margin: 0;"><b>Name:</b> ${coachData.name}</p>
                <p style="margin: 0;"><b>Category:</b> ${coachData.coachCategory?.name || "Uncategorized"
			}</p>
                <p style="margin: 0;"><b>ID:</b> ${coachData.coachId}</p>
            </div>
        `,
	};

	return (
		<div className="content-container content-height-screen">
			{downline.status === "requested" && <Invitations />}
			{downline.status === "in-downline" && (
				<Tabs
					value={selectedTab}
					onValueChange={tabChange}
					className="w-full"
				>
					<div className="flex">
						<TabsList className="grid w-full max-w-lg mx-auto mb-4 grid-cols-3">
							<TabsTrigger value="list">List View</TabsTrigger>
							<TabsTrigger value="visualizer">Visualizer</TabsTrigger>
							<TabsTrigger value="clients">Clients</TabsTrigger>
						</TabsList>
						{coachData.clubType === "System Leader" && <DownlineIncrement />}
					</div>

					<TabsContent value="list">
						<div className="flex flex-col gap-4">
							<CreateInvitation />
							<CoachesList />
						</div>
					</TabsContent>

					<TabsContent value="visualizer">
						<Card className="bg-gray-800 border-gray-700">
							<CardContent className="p-4">
								<h4 className="text-xl mb-4 text-center font-semibold text-white">
									Downline Visualizer
								</h4>
								<TreeVisualizer initialNode={initialNodeData} />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="manageCategories">
						{categoriesLoading && <ContentLoader />}
						{categoriesError && (
							<ContentError title={categoriesError.message} />
						)}
						{categories && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="text-3xl font-bold">Manage Your Categories</h2>
									<ManageCategoryModal onSave={mutateCategories}>
										<Button>
											<PlusCircle className="mr-2 h-4 w-4" /> Create New
											Category
										</Button>
									</ManageCategoryModal>
								</div>
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{categories.map((category) => (
										<Card
											key={category._id}
											className="flex flex-col bg-white dark:bg-slate-800"
										>
											<CardHeader>
												<CardTitle className="flex items-center justify-between">
													{category.name}
													<div className="flex items-center space-x-2">
														<ManageCategoryModal
															category={category}
															onSave={mutateCategories}
														>
															<Button variant="ghost" size="icon">
																<Edit className="h-4 w-4" />
															</Button>
														</ManageCategoryModal>
														<DualOptionActionModal
															title="Delete Category"
															description={`Are you sure you want to delete the "${category.name}" category?`}
															action={(setLoading, btnRef) =>
																handleDeleteCategory(
																	setLoading,
																	btnRef,
																	category._id
																)
															}
														>
															<AlertDialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="text-red-500 hover:text-red-600"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</AlertDialogTrigger>
														</DualOptionActionModal>
													</div>
												</CardTitle>
											</CardHeader>
											<CardContent className="flex-grow space-y-4">
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{category.description}
												</p>
												<div>
													<h4 className="font-semibold text-base">
														Permissions:
													</h4>
													<ul className="list-disc pl-5 text-sm space-y-1 mt-2">
														<li>
															Club Access:{" "}
															<b>{category.permissions.clubAccess}</b>
														</li>
														<li>
															Category Creation:{" "}
															<b>
																{category.permissions.categoryCreationAccess}
															</b>
														</li>
														<li>
															Downline Management:{" "}
															<b>
																{category.permissions.downlineManagementAccess}
															</b>
														</li>
													</ul>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
								{categories.length === 0 && (
									<p className="text-center py-8 text-gray-500">
										You haven't created any categories yet.
									</p>
								)}
							</div>
						)}
					</TabsContent>

					<TabsContent value="clients">
						<DownlineClientList />
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}

// --- The functions below remain unchanged ---

function Invitations() {
	const { isLoading, error, data } = useSWR("app/downline", () =>
		retrieveDownlineRequests()
	);

	if (isLoading) return <ContentLoader />;

	if (error || data.status_code !== 200)
		return <ContentError title={error || data.message} />;

	const invitations = data?.data || [];

	if (invitations.length === 0) return <></>;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="!text-[28px]">Invitations</h4>
				<StartDownline />
			</div>
			{invitations.map((invitation, index) => (
				<Card
					className="w-full max-w-md bg-[var(--comp-1)] border-2 border-[var(--accent-1)] rounded-lg p-0"
					key={index}
				>
					<CardContent className="flex flex-col gap-4 p-4">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 rounded-md overflow-hidden">
								<Avatar className="h-[60px] w-[60px] border-1">
									<AvatarImage src={invitation.profilePhoto} />
									<AvatarFallback>
										{nameInitials(invitation.name)}
									</AvatarFallback>
								</Avatar>
							</div>

							<div className="flex flex-col">
								<h2 className="text-lg font-semibold">
									{invitation.name}{" "}
									<span className="text-gray-500 text-sm">
										#{invitation.coachId}
									</span>
								</h2>
								<p className="text-sm text-gray-600">{invitation.email}</p>
								<p className="text-sm text-gray-600">
									{invitation.mobileNumber}
								</p>
							</div>
						</div>
						<hr />
						<div className="flex items-center justify-between">
							<p className="text-sm text-gray-400">
								Respond to this Invitation
							</p>
							<div className="flex gap-2">
								<ActionOnRequest
									actionType="ACCEPT_INVITE"
									coachId={invitation._id}
								>
									<Button
										variant="default"
										className="bg-green-500 hover:bg-green-600"
									>
										Confirm
									</Button>
								</ActionOnRequest>
								<ActionOnRequest
									actionType="DECLINE_INVITE"
									coachId={invitation._id}
								>
									<Button
										variant="default"
										className="bg-red-500 hover:bg-red-600"
									>
										Decline
									</Button>
								</ActionOnRequest>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function CreateInvitation() {
	const [coachId, setCoachId] = useState("");
	return (
		<div className="bg-[var(--comp-2)] w-full px-4 py-8 border-1 rounded-[8px]">
			<h4 className="mb-4">Invite a Coach</h4>
			<div className="flex flex-col gap-4">
				<FormControl
					type="text"
					placeholder="Enter Coach ID"
					value={coachId}
					onChange={(e) => setCoachId(e.target.value)}
					className="h-12"
				/>
				{coachId.length > 0 && (
					<ActionOnRequest coachId={coachId} actionType="INVITE">
						<Button variant="wz" className="max-w-xs w-full mx-auto">
							Invite Coach
						</Button>
					</ActionOnRequest>
				)}
			</div>
		</div>
	);
}

function filterCoaches(coaches = [], filters = {}) {
	return coaches.filter((coach) => {
		const {
			clubType = "all",
			syncStatus = "all",
			subscriptionStatus = "all",
			personalSubs = "all",
			clusterSubs = "all",
		} = filters;

		if (clubType !== "all" && coach.clubType !== clubType) {
			return false;
		}

		if (syncStatus !== "all") {
			const statusMap = {
				synced: 2,
				pending: 1,
				ynsynced: 0,
			};

			if (coach.super_coach?.status !== statusMap[syncStatus]) {
				return false;
			}
		}

		if (
			subscriptionStatus !== "all" &&
			coach.clubSubscription?.status !== subscriptionStatus
		) {
			if (
				subscriptionStatus === "In Active" &&
				(!coach.clubSubscription?.status ||
					coach.clubSubscription?.status === "In Active"
				)
			) {
				return true
			}
			return false;
		}

		const personalCount =
			coach.downlineAnalytics?.coachSubscriptionsLevel1 || 0;

		if (personalSubs !== "all") {
			const ranges = {
				"<50": [0, 50],
				"<100": [50, 100],
				"<250": [100, 250],
				"<400": [250, 400],
			};
			if (ranges[personalSubs]) {
				const [min, max] = ranges[personalSubs];
				if (personalCount < min || personalCount >= max) {
					return false;
				}
			}
			if (personalSubs === "+400") {
				if (personalCount <= 400) {
					return false;
				}
			}
		}

		const clusterCount =
			coach.downlineAnalytics?.clusterSubscriptions?.coachSubscriptions || 0;
		if (clusterSubs !== "all") {
			const ranges = {
				"<50": [0, 50],
				"<100": [50, 100],
				"<250": [100, 250],
				"<400": [250, 400],
			};

			if (ranges[clusterSubs]) {
				const [min, max] = ranges[clusterSubs];
				if (clusterCount < min || clusterCount >= max) {
					return false;
				}
			}

			if (clusterSubs === "+400") {
				if (clusterCount <= 400) {
					return false;
				}
			}
		}

		return true;
	});
}

function CoachesList() {
	const [filters, setFilters] = useState({
		clubType: "all",
		syncStatus: "all",
		subscriptionStatus: "all",
		personalSubs: "all",
		clusterSubs: "all",
	});
	const { downline: { depth } = {} } = useAppSelector(state => state.coach.data)
	const [query, setQuery] = useState("")
	const { clubType } = useAppSelector(state => state.coach.data)
	const { isLoading, error, data, mutate } = useSWR(
		"app/downline/coaches",
		retrieveDownlineCoaches
	);

	const allCoaches = useMemo(() => {
		const coaches = data?.data || [];
		return coaches
			.map(coach => ({
				...coach,
				downline: {
					...coach.downline,
					depth: parseInt(coach?.downline?.depth ?? 0) - parseInt(depth ?? 0)
				}
			}))
	}, [isLoading]);

	const coaches = allCoaches.filter(coach => new RegExp(query, "i").test(coach.name));

	const filteredCoaches = useMemo(() => {
		return filterCoaches(coaches, filters);
	}, [coaches, filters]);

	if (isLoading) return <ContentLoader />;

	if (error || data.status_code !== 200)
		return <ContentError title={error?.message || data.message} />;

	const handleMakeTop = async (coachId) => {
		try {
			toast.info("Make Top functionality - API endpoint needs to be implemented");
		} catch (error) {
			toast.error(error.message);
		}
	};

	const canAddCoach = ["Club Captain", "Club Leader", "System Leader"].includes(clubType);

	return (
		<div className="bg-[var(--comp-2)] px-4 py-8 rounded-[8px] space-y-4 border-1">
			<div className="flex items-center justify-between">
				<h4 className="mb-4">Coaches under You ({allCoaches.length})</h4>
				{canAddCoach && <AddCoachInDownline />}
			</div>
			<FormControl
				value={query}
				onChange={e => setQuery(e.target.value)}
				className="block [&_.input]:bg-white mb-4"
				placeholder="Search Coach Name..."
			/>
			<CoachFilters
				filters={filters}
				setFilters={setFilters}
				clubTypes={[
					"System Leader", "Club Leader", "Club Leader Jr",
					"Club Captain", "Wellness Coach", "Gold Member", "Silver Member"
				]}
			/>
			<HierarchicalCoachTable
				coaches={filteredCoaches}
				onMakeTop={handleMakeTop}
			/>
		</div>
	);
}

const subscriptionRanges = [
	{ label: "All", value: "all" },
	{ label: "< 50", value: "<50" },
	{ label: "< 100", value: "<100" },
	{ label: "< 250", value: "<250" },
	{ label: "< 400", value: "<400" },
	{ label: "> 400", value: ">400" },
];

function CoachFilters({
	filters,
	setFilters,
	clubTypes = [],
}) {
	const update = (key, value) =>
		setFilters((prev) => ({ ...prev, [key]: value }));

	const reset = () =>
		setFilters({
			clubType: "all",
			syncStatus: "all",
			subscriptionStatus: "all",
			personalSubs: "all",
			clusterSubs: "all",
		});

	const active = useMemo(
		() => Object.entries(filters).filter(([_, v]) => v !== "all"),
		[filters]
	);

	return (
		<div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
			<div className="flex items-center gap-3 flex-wrap">

				<Popover>
					<PopoverTrigger asChild>
						<Button
							size="sm"
							className="rounded-xl h-9 px-4 bg-black text-white hover:bg-neutral-800 transition-all"
						>
							<SlidersHorizontal size={16} className="mr-2" />
							Filters
							{active.length > 0 && (
								<span className="ml-2 text-xs bg-white text-black rounded-full px-2 py-0.5 font-medium">
									{active.length}
								</span>
							)}
						</Button>
					</PopoverTrigger>

					<PopoverContent className="w-[420px] rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-6">

						<div className="text-sm font-semibold tracking-wide text-neutral-700">
							Filter Results
						</div>

						<div className="grid grid-cols-2 items-center gap-4">

							<Select
								value={filters.clubType}
								onValueChange={(v) => update("clubType", v)}
							>
								<SelectTrigger className="rounded-xl h-10">
									Club Type
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Club Types</SelectItem>
									{clubTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={filters.syncStatus}
								onValueChange={(v) => update("syncStatus", v)}
							>
								<SelectTrigger className="rounded-xl h-10">
									Sync Status
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Sync Status</SelectItem>
									<SelectItem value="synced">Synced</SelectItem>
									<SelectItem value="unsynced">Un Synced</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={filters.subscriptionStatus}
								onValueChange={(v) =>
									update("subscriptionStatus", v)
								}
							>
								<SelectTrigger className="rounded-xl h-10">
									Subscription Status
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Subscription</SelectItem>
									<SelectItem value="Active">Active</SelectItem>
									<SelectItem value="In Active">In Active</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={filters.personalSubs}
								onValueChange={(v) => update("personalSubs", v)}
							>
								<SelectTrigger className="rounded-2xl h-11 px-4 border-neutral-300 bg-white hover:bg-neutral-50 transition">
									Personal Subscriptions
								</SelectTrigger>

								<SelectContent className="rounded-2xl shadow-xl border-neutral-200">
									{subscriptionRanges.map((range) => (
										<SelectItem
											key={range.value}
											value={range.value}
											className="rounded-xl cursor-pointer"
										>
											{range.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={filters.clusterSubs}
								onValueChange={(v) => update("clusterSubs", v)}
							>
								<SelectTrigger className="rounded-xl h-10">
									Cluster Subs
								</SelectTrigger>
								<SelectContent className="rounded-2xl shadow-xl border-neutral-200">
									{subscriptionRanges.map((range) => (
										<SelectItem
											key={range.value}
											value={range.value}
											className="rounded-xl cursor-pointer"
										>
											{range.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

						</div>

						<div className="flex justify-between items-center pt-2 border-t border-neutral-200">
							<div className="text-xs text-neutral-500">
								{active.length} filter{active.length !== 1 && "s"} applied
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="rounded-xl"
								onClick={reset}
							>
								Clear All
							</Button>
						</div>
					</PopoverContent>
				</Popover>

			</div>
		</div>
	);
}

function StartDownline() {
	async function startDownline(setLoading, closeBtnRef) {
		try {
			setLoading(true);
			const response = await sendData("app/downline/requests", {}, "PUT");
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success(response.message);
			closeBtnRef.current.click();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<DualOptionActionModal
			asChild
			description="Are you sure to start your downline?"
			action={(setLoading, btnRef) => startDownline(setLoading, btnRef)}
		>
			<AlertDialogTrigger asChild>
				<Button variant="wz">Start Downline</Button>
			</AlertDialogTrigger>
		</DualOptionActionModal>
	);
}

function ActionOnRequest({
	children,
	actionType,
	coachId
}) {
	async function actionOnRequest(setLoading) {
		try {
			setLoading(true);
			const response = await sendData("app/downline/requests", { actionType, coachId }, "PATCH");
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success(response.message);
			location.reload()
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}

	return <DualOptionActionModal
		action={(setLoading, btnRef) => actionOnRequest(setLoading, btnRef)}
	>
		<AlertDialogTrigger asChild>
			{children}
		</AlertDialogTrigger>
	</DualOptionActionModal>
}

export function SyncCoachComponent({ coach }) {
	const { clubType } = useAppSelector((state) => state.coach.data)
	if (!["Club Leader", "System Leader"].includes(clubType)) return null

	return (
		<div className="flex items-center gap-2">
			<SyncCoachDropdown
				coachId={coach._id}
				status={coach.super_coach?.status}
			/>
		</div>
	)
}

function SyncCoachDropdown({ coachId, status }) {
	const [loading, setLoading] = useState(false)
	const [openModal, setOpenModal] = useState(false)
	const [pendingStatus, setPendingStatus] = useState(null)

	const currentStatus = status === 2 ? "Synced" : "Unsynced"

	async function handleSyncAction(setLoadingFn, closeRef) {
		try {
			setLoadingFn(true)
			const response = await sendData(`app/sync-coach/super`, {
				status: pendingStatus,
				coachId,
			})
			if (response.status_code !== 200) throw new Error(response.message)
			toast.success(response.message)
			location.reload()
			closeRef.current.click()
		} catch (error) {
			toast.error(error.message)
		} finally {
			setLoadingFn(false)
			setOpenModal(false)
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						size="sm"
						variant={"icon"}
						disabled={loading}
						className={cn(
							"h-auto py-[6px]",
							currentStatus === "Synced"
								? "bg-[var(--accent-1)] text-white font-bold text-[14px]"
								: "bg-[var(--accent-2)] text-white font-bold text-[14px]"
						)}
					>
						{currentStatus}
						<ChevronDown className="h-[20px] w-[20px]" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() => {
							setPendingStatus(2)
							setOpenModal(true)
						}}
						disabled={loading || status === 2}
					>
						Sync
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							setPendingStatus(3)
							setOpenModal(true)
						}}
						disabled={loading || status === 3}
						className="text-destructive"
					>
						Unsync
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Confirmation Modal */}
			{openModal && (
				<DualOptionActionModal
					defaultOpen
					description={`Are you sure you want to ${pendingStatus === 2 ? "sync" : "unsync"
						} this coach?`}
					action={handleSyncAction}
					onClose={() => setOpenModal(false)}
				/>
			)}
		</>
	)
}

function ClientActionsDropdown({ client }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreVertical className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="!gap-0 !space-y-0">
				<ClientUpdateCategories clientData={client}>
					<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
						<DialogTrigger asChild>
							<span className="w-full cursor-pointer">Add Categories</span>
						</DialogTrigger>
					</DropdownMenuItem>
				</ClientUpdateCategories>
				<DeleteClientModal
					onClose={() => mutate("downline-clients")}
					_id={client._id}
					pushMandtory={false}
					className="w-full"
				>
					<DropdownMenuItem className="w-full" onSelect={(e) => e.preventDefault()}>
						<div className="w-full cursor-pointer flex items-center gap-2">
							<Trash2 className="w-4 h-4" />
							Delete
						</div>
					</DropdownMenuItem>
				</DeleteClientModal>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function DownlineClientList() {
	const [filters, setFilters] = useState({
		coach: [],
		status: [],
		categories: [],
	});
	const [query, setQuery] = useState("");
	const regex = new RegExp(query, "i")
	const { isLoading, error, data } = useSWR(
		"downline-clients",
		() => retrieveClientList()
	);
	const { clubType, client_categories } = useAppSelector(state => state.coach.data)
	const catsMap = useMemo(() => new Map(client_categories.map(item => [item._id, item.name])), [])

	if (isLoading) return <ContentLoader />

	if (error || data.status_code !== 200) return <ContentError title={error?.message || data.message} />

	const clients = data.data.filter((client) => {
		const nameMatch = regex.test(client.name);
		const coachMatch =
			filters.coach.length === 0 ||
			filters.coach.includes(client.coachName);
		const statusMatch =
			filters.status.length === 0 ||
			filters.status.includes(client.isSubscription);
		const categoryMatch =
			filters.categories.length === 0 ||
			client.categories?.some(cat =>
				filters.categories.includes(cat)
			);
		return nameMatch && coachMatch && statusMatch && categoryMatch;
	}) || [];

	const hasEditAccess = ["System Leader", "Club Leader", "Club Leader Jr"].includes(clubType)
	const coachOptions = [
		...new Set(data.data.map(c => c.coachName).filter(Boolean))
	].map(name => ({ label: name, value: name }));

	const categoryOptions = [
		...new Set(
			data.data.flatMap(c => c.categories || [])
		)
	]
		.filter(cat => catsMap.has(cat))
		.map(cat => ({
			label: String(catsMap.get(cat)),
			value: cat
		}));
	return <div className="bg-[var(--comp-1)] p-4 rounded-[10px] border-1">
		<div className="flex items-center gap-4">
			<FormControl
				value={query}
				onChange={e => setQuery(e.target.value)}
				className="[&_.input]:bg-white grow ![&_.input]:py-1"
				placeholder="search by name..."
			/>
			<FilterPopover
				filtersConfig={[
					{
						key: "coach",
						label: "Coach",
						type: "multi",
						options: coachOptions,
					},
					{
						key: "status",
						label: "Status",
						type: "multi",
						options: [
							{ label: "Active", value: true },
							{ label: "Inactive", value: false },
						],
					},
					{
						key: "categories",
						label: "Categories",
						type: "multi",
						options: categoryOptions,
					},
				]}
				onChange={(key, updatedValues) => {
					setFilters(prev => ({
						...prev,
						[key]: updatedValues,
					}));
				}}
				values={filters}
			/>
		</div>
		<Table className="border-1 mt-4">
			<TableHeader>
				<TableRow className="bg-white [&_th]:font-bold">
					<TableHead>Name</TableHead>
					<TableHead>Categories</TableHead>
					<TableHead>Coach Name</TableHead>
					<TableHead>Club Leader</TableHead>
					<TableHead>Client ID</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Mobile</TableHead>
					<TableHead>City</TableHead>
					<TableHead>Status</TableHead>
					<TableHead />
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{clients.map((client) => (
					<TableRow key={client._id}>
						<TableCell className="font-medium max-w-[20ch]">{client.name}</TableCell>
						<ClientCategoriesListing categories={client.categories} />
						<TableCell>{client.coachName}</TableCell>
						<TableCell>{client.clubTypeClubLeader}</TableCell>
						<TableCell>{client.clientId}</TableCell>
						<TableCell>{client.email || "-"}</TableCell>
						<TableCell>{client.mobileNumber || "-"}</TableCell>
						<TableCell>{client.city || "-"}</TableCell>
						<TableCell>{client?.isSubscription
							? <Badge variant="wz_fill">Active</Badge>
							: <Badge variant="destructive">In active</Badge>}</TableCell>
						{<TableCell onClick={e => e.stopPropagation()}>
							{hasEditAccess && <SyncedCoachClientDetails
								client={client}
								onUpdate={() => location.reload()}
							>
								<DialogTrigger>
									<Eye className="hover:text-[var(--accent-1)] opacity-50 hover:opacity-100" />
								</DialogTrigger>
							</SyncedCoachClientDetails>}
						</TableCell>}
						<TableCell onClick={e => e.stopPropagation()}>
							{hasEditAccess && <ClientActionsDropdown client={client} />}
						</TableCell>
					</TableRow>
				))}
				{clients.length === 0 && (
					<TableRow>
						<TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
							No clients found
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	</div>
}

function AddCoachInDownline() {
	const [formData, setFormData] = useState({
		hid: "",
		name: "",
		city: "",
		mobileNumber: "",
		email: "",
		downlineCoachId: ""
	})
	const { clubType } = useAppSelector(state => state.coach.data)

	const handleChange = (e, name) => {
		setFormData({ ...formData, [name]: e.target.value })
	}

	async function handleAddCoach() {
		try {
			const response = await sendData("app/downline/coach-manage", formData, "POST")
			if (response.status_code !== 200) throw new Error(response.message)
			toast.success(response.message)
			location.reload()
		} catch (error) {
			toast.error(error.message)
		}
	}

	if (!["System Leader", "Club Leader", "Club Leader"].includes(clubType)) return

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="wz">Add Coach</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[400px] p-0">
				<DialogTitle className="p-4 border-b-1">Add Coach</DialogTitle>
				<div className="p-4 pt-0">
					<FormControl
						placeholder="HID Of Coach"
						value={formData.hid}
						onChange={e => handleChange(e, "hid")}
						className="block mb-4"
					/>
					<FormControl
						placeholder="Name Of Coach"
						value={formData.name}
						onChange={e => handleChange(e, "name")}
						className="block mb-4"
					/>
					<FormControl
						placeholder="City"
						value={formData.city}
						onChange={e => handleChange(e, "city")}
						className="block mb-4"
					/>
					<FormControl
						placeholder="Mobile Number"
						value={formData.mobileNumber}
						onChange={e => handleChange(e, "mobileNumber")}
						className="block mb-4"
						type="number"
					/>
					<FormControl
						placeholder="Email"
						className="block mb-4"
						value={formData.email}
						onChange={e => handleChange(e, "email")}
						type="email"
					/>
					<SelectDownlineCoach onChange={value => setFormData({
						...formData,
						downlineCoachId: value
					})} />
					<Button variant="wz" onClick={handleAddCoach}>Save</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

function SelectDownlineCoach({ onChange }) {
	const coach = useAppSelector(state => state.coach.data)
	const [query, setQuery] = useState("")
	const { isLoading, error, data } = useSWR(
		"app/downline/coaches",
		retrieveDownlineCoaches
	);

	const allDownlineCoaches = useMemo(() => [
		coach,
		...data.data,
	], [])

	if (isLoading) return <ContentLoader />

	if (error || data.status_code !== 200) return <ContentError title={error?.message || data.message} />

	const coaches = allDownlineCoaches
		.filter(coach => new RegExp(query, "i").test(coach.name)) || [];

	return <Select
		onValueChange={value => onChange(value)}
	>
		<SelectTrigger className="w-full mb-4 py-2">
			<SelectValue placeholder="Select Upline Coach" />
		</SelectTrigger>
		<SelectContent side="top" align="start">
			<div
				className="px-2 pb-2"
				onKeyDown={(e) => e.stopPropagation()}
				onKeyUp={(e) => e.stopPropagation()}
				onKeyPress={(e) => e.stopPropagation()}
			>
				<FormControl
					value={query}
					onChange={e => setQuery((e.target.value))}
					className="mb-2 block"
					placeholder="Search by name..."
				/>
			</div>
			{coaches.length === 0 && (
				<div className="px-3 py-2 text-sm text-muted-foreground">
					No results found
				</div>
			)}
			{coaches.map(coach => <SelectItem
				key={coach._id}
				value={coach._id}
			>
				<Avatar>
					<AvatarImage src={coach.profilePhoto} />
					<AvatarFallback>{nameInitials(coach.name)}</AvatarFallback>
				</Avatar>
				{coach.name}
			</SelectItem>)}
		</SelectContent>
	</Select>
}

function ClientCategoriesListing({ categories = [] }) {
	const { client_categories } = useAppSelector(state => state.coach.data)

	const selectedCategories = useMemo(() => findClientCategories(categories, client_categories), [])

	if (categories.length === 0) return <TableCell className="opacity-50">
		-
	</TableCell>

	return <TableCell className="flex items-center gap-1">
		{selectedCategories
			.slice(0, 2)
			.map(cat => <span
				key={cat.id}
				className="px-2 py-1 text-[12px] bg-[var(--accent-1)] rounded-full text-white"
			>
				{cat.name}
			</span>)}
		<Tooltip>
			<TooltipTrigger className="px-2 py-1 text-[12px] bg-[var(--accent-1)] rounded-full text-white">
				<Plus className="w-[16px] h-[16px]" />
			</TooltipTrigger>
			<TooltipContent className="w-[300px] bg-[var(--comp-1)] border-1 border-[#8080808D] shadow-xl p-4 flex gap-x-1 gap-y-2 flex-wrap">
				{selectedCategories
					.map(cat => <span
						key={cat.id}
						className="px-2 py-1 text-[12px] bg-[var(--accent-1)] rounded-full text-white font-bold"
					>
						{cat.name}
					</span>)}
			</TooltipContent>
		</Tooltip>
	</TableCell>
}

function findClientCategories(categories = [], coachCategories) {
	const coachCategoryMap = new Map(
		coachCategories.map(cat => [cat._id, cat.name])
	)
	return (categories || [])
		.map(cat => ({
			id: cat,
			name: coachCategoryMap.get(cat)
		}))
}

function DownlineIncrement() {
	return <Dialog>
		<DialogTrigger asChild>
			<Button variant="wz">Qualifications</Button>
		</DialogTrigger>
		<DialogContent className="!max-w-[800px] w-full p-0 gap-0">
			<DownlineCoachIncrementContainer />
		</DialogContent>
	</Dialog>
}

const sortCoaches = function (key) {
	return (coachA, coachB) =>
		parseInt(coachA?.percentages[key]) > parseInt(coachB?.percentages[key])
			? -1
			: 1
}

const isEligible = (percent) => Math.ceil(parseInt(percent)) === 100;

const clubTypeOptions = [
	{ id: 2, name: "Club Leader Jr", value: "clubLeaderJr" },
	{ id: 3, name: "Club Captain", value: "clubCaptain" },
]

function DownlineCoachIncrementContainer() {
	const [selectedClubType, setSelectedClubType] = useState(["clubLeaderJr", "clubCaptain"])
	const { _id: coachId } = useAppSelector(state => state.coach.data)
	const { isLoading, error, data, mutate } = useSWR(
		"way-to-wellness/increment",
		() => fetchData(`way-to-wellness/increment?coachId=${coachId}`)
	)

	const coaches = Object
		.entries(data?.data || [])
		.map(([_, coaches]) => coaches)
		.flatMap(coach => coach)

	const ALL_MONTHS_OPTION = "All Months";
	const NOT_SET_MONTH = "Not Set";
	const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS_OPTION);

	const eligibilityMonths = useMemo(() => {
		const uniqueMonths = [];
		coaches.forEach((coach) => {
			const month = coach.eligibilityMonth ?? NOT_SET_MONTH;
			if (!uniqueMonths.includes(month)) {
				uniqueMonths.push(month);
			}
		});
		return uniqueMonths;
	}, [coaches]);

	const filteredCoaches = useMemo(() => {
		if (selectedMonth === ALL_MONTHS_OPTION) {
			return coaches;
		}
		return coaches.filter(
			coach => (coach.eligibilityMonth ?? NOT_SET_MONTH) === selectedMonth
		);
	}, [coaches, selectedMonth]);

	const clubLeaderJr = filteredCoaches
		?.filter(coach => coach?.eligibleFor === "clubLeaderJr")
		?.sort(sortCoaches("clubLeaderJr"))

	const clubCaptain = filteredCoaches
		?.filter(coach => coach?.eligibleFor === "clubCaptain")
		?.sort(sortCoaches("clubCaptain"))

	function exportCoachData(targetCoaches = filteredCoaches) {
		const excelData = targetCoaches.map(coach => ({
			"Coach Name": coach.coach,
			"Mobile Number": coach.mobileNumber,
			"Club Type": coach.clubType,
			"Qualified For": coach.qualifiedClubType,
			"Eligibility Month": coach.eligibilityMonth ?? NOT_SET_MONTH,
		}))
		exportToExcel(excelData)
	}

	const emptyMessage = coaches.length === 0
		? "No coaches found that are qualified"
		: selectedMonth === ALL_MONTHS_OPTION
			? "No coaches found that are qualified"
			: `No coaches found for "${selectedMonth}" eligibility month.`;

	if (isLoading) return <div className="min-h-[200px] flex items-center justify-center">
		<Loader />
	</div>

	if (error || data?.status_code !== 200) return <div className="min-h-[200px] flex items-center justify-center">
		{error || data?.message || "Something went wrong"}
	</div>

	return <div className="overflow-clip max-h-[70vh] overflow-y-auto">
		<DialogTitle className="p-4 border-b-1">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
					<span className="text-lg font-semibold mr-auto">Qualifications</span>
				</div>
				{coaches.length > 0 && <Button
					className="mr-4 bg-[var(--accent-1)] text-white"
					variant="icon"
					size="sm"
					onClick={() => exportCoachData(filteredCoaches)}
				>
					Download
					<FileSpreadsheet />
				</Button>}
			</div>
		</DialogTitle>
		<div className="px-4 flex items-center justify-between gap-4">
			<div className="py-2 flex items-center gap-2 ml-auto">
				<span className="text-sm font-medium text-muted-foreground">Filters</span>
				<Select
					value={selectedMonth}
					onValueChange={value => setSelectedMonth(value)}
				>
					<SelectTrigger className="min-w-[180px] py-2 text-sm">
						<SelectValue placeholder={ALL_MONTHS_OPTION} />
					</SelectTrigger>
					<SelectContent side="bottom">
						<SelectItem value={ALL_MONTHS_OPTION}>All Months</SelectItem>
						{eligibilityMonths.map(month => (
							<SelectItem key={month} value={month}>
								{month}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<SelectMultiple
				label="Club Type"
				align="topx"
				options={clubTypeOptions}
				onChange={setSelectedClubType}
				value={selectedClubType}
			/>
		</div>
		<Table className="bg-[var(--comp-1)] rounded-md">
			<TableHeader className="[&_th]:font-bold">
				<TableRow>
					<TableHead>Coach Name</TableHead>
					<TableHead>Mobile Number</TableHead>
					<TableHead>Club Type</TableHead>
					<TableHead>Qualified Club Type</TableHead>
					<TableHead>Percent</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{selectedClubType.includes("clubLeaderJr") && clubLeaderJr?.map(coach => (
					<TableRow key={coach._id}>
						<TableCell>{coach.coach}</TableCell>
						<TableCell>{coach.mobileNumber}</TableCell>
						<TableCell>{coach.clubType}</TableCell>
						<TableCell className="flex items-center gap-1">
							{coach.qualifiedClubType}
							{isEligible(coach?.percentages?.clubLeaderJr) && <QualifyCoachClubType
								mutate={mutate}
								coachId={coach._id}
								clubType={coach.qualifiedClubType}
							/>}
						</TableCell>
						<TableCell className="w-[300px]">
							<span className="flex items-center gap-2">
								{coach?.percentages?.clubLeaderJr}
								<Progress value={coach?.percentages?.clubLeaderJr} />
							</span>
						</TableCell>
					</TableRow>
				))}
				{selectedClubType.includes("clubCaptain") && clubCaptain?.map(coach => (
					<TableRow key={coach._id}>
						<TableCell>{coach.coach}</TableCell>
						<TableCell>{coach.mobileNumber}</TableCell>
						<TableCell>{coach.clubType}</TableCell>
						<TableCell className="flex items-center gap-1">
							{coach.qualifiedClubType}
							{isEligible(coach?.percentages?.clubCaptain) && <QualifyCoachClubType
								mutate={mutate}
								coachId={coach._id}
								clubType={coach.qualifiedClubType}
							/>}
						</TableCell>
						<TableCell className="w-[300px]">
							<span className="flex items-center gap-2">
								{coach?.percentages?.clubCaptain}
								<Progress value={coach?.percentages?.clubCaptain} />
							</span>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
		{selectedClubType.length === 0 && <div className="flex flex-col items-center justify-center py-10 bg-white shadow-sm">
			<div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
				<FilterX className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
			</div>
			<h3 className="text-lg font-semibold text-gray-800">
				No Club Type Selected
			</h3>
			<p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
				Please select at least one club type from the filters above to view coach qualification data.
			</p>
			<div className="mt-6 text-xs text-gray-400">
				Use the <span className="font-medium text-gray-600">Filters</span> dropdown to continue.
			</div>
		</div>}
		{filteredCoaches.length === 0 && <div className="h-[200px] flex items-center justify-center">
			{emptyMessage}
		</div>}
	</div>
}


function QualifyCoachClubType({ mutate, coachId, clubType }) {
	async function qualifyCoach(setLoading, closeBtnRef) {
		try {
			setLoading(true);
			const formData = {
				coachId,
				clubType
			}
			const response = await sendData("way-to-wellness/increment", formData, "POST");
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success(response.message);
			mutate()
			closeBtnRef.current.click();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}
	return <DualOptionActionModal
		description={`Are you sure of qualifying this coach for ${clubType}!`}
		action={(setLoading, btnRef) => qualifyCoach(setLoading, btnRef)}
	>
		<AlertDialogTrigger>
			<Check className="w-[28px] h-[28px] text-white bg-[var(--accent-1)] p-[6px] rounded-full" />
		</AlertDialogTrigger>
	</DualOptionActionModal>
}

function FilterPopover({
	filtersConfig,
	values,
	onChange,
}) {

	const [searchMap, setSearchMap] = useState({});

	const handleToggle = (key, value) => {
		const current = values[key] || [];

		const updated = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];

		onChange(key, updated);
	};

	const clearFilter = (key) => {
		onChange(key, []);
	};

	const totalActive = Object.values(values).reduce(
		(acc, curr) => acc + (curr?.length || 0),
		0
	);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button>
					<Funnel />
					Filters
					{totalActive > 0 && (
						<span className="ml-2 text-xs text-gray-200">
							({totalActive})
						</span>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-[480px] grid grid-cols-2 gap-4 p-5 rounded-2xl border shadow-xl bg-white space-y-6">
				{filtersConfig.map((filter) => {
					const search = searchMap[filter.key] || "";

					const filteredOptions = filter.options.filter((opt) =>
						opt.label
							.toLowerCase()
							.includes(search.toLowerCase())
					);

					return (
						<div key={filter.key} className="space-y-3">
							<div className="flex justify-between items-center">
								<p className="text-sm font-medium">
									{filter.label}
								</p>
								{values[filter.key]?.length > 0 && (
									<button
										onClick={() =>
											clearFilter(filter.key)
										}
										className="text-xs text-gray-500 hover:text-black"
									>
										Clear
									</button>
								)}
							</div>
							<Input
								placeholder={`Search ${filter.label}`}
								value={search}
								onChange={(e) =>
									setSearchMap({
										...searchMap,
										[filter.key]: e.target.value,
									})
								}
								className="h-8 text-sm"
							/>
							<div className="max-h-40 overflow-y-auto space-y-2">
								{filteredOptions.map((opt) => (
									<label
										key={opt.value}
										className="flex items-center gap-2 cursor-pointer"
									>
										<Checkbox
											checked={
												values[filter.key]?.includes(
													opt.value
												) || false
											}
											onCheckedChange={() =>
												handleToggle(
													filter.key,
													opt.value
												)
											}
										/>
										<span className="text-sm">
											{opt.label}
										</span>
									</label>
								))}
							</div>
						</div>
					);
				})}
			</PopoverContent>
		</Popover>
	);
}