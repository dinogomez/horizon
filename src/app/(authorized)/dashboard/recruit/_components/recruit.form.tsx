"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
    regions,
    provinces,
    cities,
    barangays,
} from "select-philippines-address";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Barangay, City, Province, Region } from "@/lib/types";
import { numberOfEmployee } from "@/lib/data/data.number-employees";
import { Tag, TagInput } from "@/components/ui/tag/tag-input";
import { Markets } from "@/lib/data/data.markets";
import { CompanySchema } from "@/lib/schema/zod/company.schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JobSchema } from "@/lib/schema/zod/job.schema";
import Tiptap from "@/components/tiptap/tiptap";
import { jobTypeEnum, workArrangementEnum } from "@/lib/data/data.enum";
import { Skills } from "@/lib/data/data.skills";
import { CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "@/components/provider/session-provider";
import { MergeSchema } from "@/lib/schema/zod/merge.schema";
import { years } from "@/lib/data/data.years";
import { recruitAction } from "@/lib/actions/auth.actions";

type Inputs = z.infer<typeof MergeSchema>;

const steps = [
    {
        id: "Step 1",
        name: "Company Information",
        fields: [
            "companyName",
            "companyLogo",
            "companyDesc",
            "industry",
            "companyEmail",
            "website",
            "province",
            "city",
            "barangay",
            "numEmployee",
        ],
    },
    {
        id: "Step 2",
        name: "Create a Job",
        fields: [
            "jobTitle",
            "jobDesc",
            "jobType",
            "workArrangement",
            "yearsExp",
            "skills",
            "jProvince",
            "jCity",
            "jBarangay",
            "primaryEmail",
            "redirectUrl",
        ],
    },
    { id: "Step 3", name: "Complete" },
];

export default function RecruitForm() {
    const { user } = useSession();

    const [provinceData, setProvince] = useState<Province[]>([]);
    const [cityData, setCity] = useState<City[]>([]);
    const [barangayData, setBarangay] = useState<Barangay[]>([]);

    const [jcityData, jsetCity] = useState<City[]>([]);
    const [jbarangayData, jsetBarangay] = useState<Barangay[]>([]);

    const [previousStep, setPreviousStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>();
    const [imageBase64, setImageBase64] = useState<string>("");
    const [industryTags, setIndustryTags] = useState<Tag[]>([]);
    const [skillTags, setSkillTags] = useState<Tag[]>([]);

    const [useEmail, setUseEmail] = useState(false);

    const delta = currentStep - previousStep;

    const city = (e: string) => {
        cities(e).then((response) => {
            setCity(response);
        });
    };

    const barangay = (e: string) => {
        barangays(e).then((response) => {
            setBarangay(response);
        });
    };

    const jcity = (e: string) => {
        cities(e).then((response) => {
            jsetCity(response);
        });
    };

    const jbarangay = (e: string) => {
        barangays(e).then((response) => {
            jsetBarangay(response);
        });
    };

    const loadAllProvinces = async () => {
        try {
            const allRegions = await regions();
            const allProvinces = await Promise.all(
                allRegions.map((region: Region) =>
                    provinces(region.region_code)
                )
            );
            const flattenedProvinces = allProvinces.flat();
            const sortedProvinces = flattenedProvinces
                .sort((a, b) => a.province_name.localeCompare(b.province_name))
                .filter(
                    (province) =>
                        province.province_name !==
                        "Ncr, City Of Manila, First District"
                );
            setProvince(sortedProvinces);
        } catch (error) {
            console.error("Error loading provinces:", error);
        }
    };

    const form = useForm<z.infer<typeof MergeSchema>>({
        resolver: zodResolver(MergeSchema),
        mode: "onChange",
        defaultValues: {
            companyName: "",
            companyDesc: "",
            companyEmail: "",
            companyLogo: "",
            website: "",
            province: "",
            city: "",
            barangay: "",
            industry: [],
            numEmployee: "",
            jobTitle: "",
            jobDesc: "",
            skills: [],
            jobType: "Full-Time",
            workArrangement: "Hybrid",
            primaryEmail: "",
            secondaryEmail: "",
            jProvince: "",
            jCity: "",
            jBarangay: "",
            redirectUrl: "",
            userId: user?.id,
        },
    });
    const { reset, trigger, handleSubmit } = form;

    form.register("industry", {
        value: industryTags.map((tag) => tag.text),
    });

    form.register("skills", {
        value: skillTags.map((tag) => tag.text),
    });

    useEffect(() => {
        const industryValues = industryTags.map((tag) => tag.text);
        form.setValue("industry", industryValues);
        if (industryTags.length > 0) {
            form.trigger("industry");
        }
    }, [industryTags, form]);

    useEffect(() => {
        const skillsValues = skillTags.map((tag) => tag.text);
        form.setValue("skills", skillsValues);
        if (skillTags.length > 0) {
            form.trigger("skills");
        }
    }, [skillTags, form]);

    useEffect(() => {
        if (useEmail) {
            form.setValue("primaryEmail", user!.email);
        }
    }, [useEmail, form]);

    useEffect(() => {
        form.setValue("companyLogo", imageBase64);
    }, [imageBase64]);

    useEffect(() => {
        loadAllProvinces();
    }, []);

    type FieldName = keyof Inputs;
    const processForm: SubmitHandler<Inputs> = async (data) => {
        const res = await recruitAction(data);
        console.log(res);
        reset();
    };
    const next = async () => {
        const fields = steps[currentStep].fields;
        const output = await trigger(fields as FieldName[], {
            shouldFocus: true,
        });

        if (!output) return;

        if (currentStep < steps.length - 1) {
            if (currentStep === steps.length - 2) {
                await handleSubmit(processForm)();
            }
            setPreviousStep(currentStep);
            setCurrentStep((step) => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setPreviousStep(currentStep);
            setCurrentStep((step) => step - 1);
        }
    };

    const handleImageChange = (file: FileList | null) => {
        if (file?.[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImageBase64(base64String);
                setImagePreviewUrl(reader.result as string);
                console.log(base64String);
            };
            reader.readAsDataURL(file[0]);
        }
    };

    return (
        <section className="flex flex-col justify-between p-24 pt-10">
            {/* steps */}
            <nav aria-label="Progress">
                <ol
                    role="list"
                    className="space-y-4 md:flex md:space-x-8 md:space-y-0"
                >
                    {steps.map((step, index) => (
                        <li key={step.name} className="md:flex-1">
                            {currentStep > index ? (
                                <div className="group flex w-full flex-col border-l-4 border-highlight py-2 pl-4 transition-colors md:border-l-0 md:border-t-8 md:pb-0 md:pl-0 md:pt-4">
                                    <span className="text-sm font-medium text-highlight transition-colors ">
                                        {step.id}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {step.name}
                                    </span>
                                </div>
                            ) : currentStep === index ? (
                                <div
                                    className="flex w-full flex-col border-l-4 border-highlight py-2 pl-4 md:border-l-0 md:border-t-8 md:pb-0 md:pl-0 md:pt-4"
                                    aria-current="step"
                                >
                                    <span className="text-sm font-medium text-highlight">
                                        {step.id}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {step.name}
                                    </span>
                                </div>
                            ) : (
                                <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-8 md:pb-0 md:pl-0 md:pt-4">
                                    <span className="text-sm font-medium text-muted-foreground transition-colors">
                                        {step.id}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {step.name}
                                    </span>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Form */}
            <Form {...form}>
                <form
                    className="mt-5 py-12"
                    onSubmit={handleSubmit(processForm)}
                >
                    {currentStep === 0 && (
                        <motion.div
                            initial={{
                                x: delta >= 0 ? "50%" : "-50%",
                                opacity: 0,
                            }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="mx-auto w-8/12"
                        >
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    <h2 className="text-base font-semibold leading-7 text-gray-900">
                                        About your company
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                        Provide your company details.
                                    </p>
                                </div>

                                <Image
                                    priority
                                    src={
                                        form.getFieldState("companyLogo")
                                            .invalid
                                            ? "/200x200.svg"
                                            : imagePreviewUrl
                                              ? imagePreviewUrl
                                              : "/200x200.svg"
                                    }
                                    className="h-32 w-32 rounded-md border border-input bg-background p-1"
                                    width={128}
                                    height={128}
                                    alt="Logo"
                                />
                            </div>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="companyName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Company Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Company Name"
                                                        type="text"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    This is your public company
                                                    name.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="companyLogo"
                                        render={({
                                            field: {
                                                value,
                                                onChange,
                                                ...fieldProps
                                            },
                                        }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Company Logo
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...fieldProps}
                                                        placeholder="logo"
                                                        type="file"
                                                        accept="image/jpeg, image/jpg,image/png,"
                                                        onChange={(event) => {
                                                            handleImageChange(
                                                                event.target
                                                                    .files
                                                            );
                                                            onChange(
                                                                event.target
                                                                    .files &&
                                                                    event.target
                                                                        .files[0]
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormDescription className="">
                                                    Images up to 5MB{" "}
                                                    {"(PNG, JPG, JPEG)"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="companyDesc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Company Description
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe your company"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    What is your company about?
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="industry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Industry
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="w-full">
                                                        <TagInput
                                                            {...field}
                                                            placeholder="Search for industries."
                                                            tags={industryTags}
                                                            enableAutocomplete
                                                            maxTags={5}
                                                            autocompleteOptions={
                                                                Markets
                                                            }
                                                            className="sm:min-w-[450px]"
                                                            setTags={(
                                                                newTags
                                                            ) => {
                                                                setIndustryTags(
                                                                    newTags
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    What industries is the
                                                    company in? Maximum of 5.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="companyEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Company Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="company@email.com"
                                                        {...field}
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="https://www.company.com/"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="numEmployee"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Number of Employees
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select the number of employees" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {numberOfEmployee &&
                                                            numberOfEmployee.length >
                                                                0 &&
                                                            numberOfEmployee.map(
                                                                (item) => (
                                                                    <SelectItem
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        value={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    How big is the company?
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <h2 className="text-base font-semibold leading-7 text-gray-900">
                                                Location
                                            </h2>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                Where is the company located?
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="province"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Province
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue(
                                                            "province",
                                                            provinceData.find(
                                                                (
                                                                    item: Province
                                                                ) =>
                                                                    item.province_code ===
                                                                    value
                                                            )?.province_name ??
                                                                ""
                                                        );
                                                        city(value);
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a Province" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {provinceData &&
                                                            provinceData.length >
                                                                0 &&
                                                            provinceData.map(
                                                                (
                                                                    item: Province
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            item.province_code
                                                                        }
                                                                        value={
                                                                            item.province_code
                                                                        }
                                                                    >
                                                                        {
                                                                            item.province_name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Select your province.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    City
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue(
                                                            "city",
                                                            cityData.find(
                                                                (item: City) =>
                                                                    item.city_code ===
                                                                    value
                                                            )?.city_name ?? ""
                                                        );
                                                        barangay(value);
                                                    }}
                                                    defaultValue={field.value}
                                                    disabled={
                                                        !form.getValues(
                                                            "province"
                                                        )
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a city" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {cityData &&
                                                            cityData.length >
                                                                0 &&
                                                            cityData.map(
                                                                (
                                                                    item: City
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            item.city_code
                                                                        }
                                                                        value={
                                                                            item.city_code
                                                                        }
                                                                    >
                                                                        {
                                                                            item.city_name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Select your city.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="barangay"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel optional={true}>
                                                    Barangay
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue(
                                                            "barangay",
                                                            barangayData.find(
                                                                (
                                                                    item: Barangay
                                                                ) =>
                                                                    item.brgy_code ===
                                                                    value
                                                            )?.brgy_name ?? ""
                                                        );
                                                    }}
                                                    defaultValue={field.value}
                                                    disabled={
                                                        !form.getValues("city")
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a Barangay" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {barangayData &&
                                                            barangayData.length >
                                                                0 &&
                                                            barangayData.map(
                                                                (
                                                                    item: Barangay
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            item.brgy_code
                                                                        }
                                                                        value={
                                                                            item.brgy_code
                                                                        }
                                                                    >
                                                                        {
                                                                            item.brgy_name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Select your barangay.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div
                            initial={{
                                x: delta >= 0 ? "50%" : "-50%",
                                opacity: 0,
                            }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="mx-auto w-8/12"
                        >
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    <h2 className="text-base font-semibold leading-7 text-gray-900">
                                        Job Details
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                        What is the job about?
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="jobTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Job Title
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Job Title"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    What is the position called?
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="jobDesc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Job Description
                                                </FormLabel>
                                                <FormControl className="">
                                                    <Tiptap
                                                        onChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    What are the job
                                                    responsibilities?
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="skills"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Skills
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="w-full">
                                                        <TagInput
                                                            {...field}
                                                            placeholder="Search for skills."
                                                            tags={skillTags}
                                                            restrictTagsToAutocompleteOptions
                                                            enableAutocomplete
                                                            maxTags={5}
                                                            autocompleteOptions={
                                                                Skills
                                                            }
                                                            className="sm:min-w-[450px]"
                                                            setTags={(
                                                                newTags
                                                            ) => {
                                                                setSkillTags(
                                                                    newTags
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    What skills are needed for
                                                    the job? Maximum of 5.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="yearsExp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Years of Experience
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select the years of experience" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {years &&
                                                            years.length > 0 &&
                                                            years.map(
                                                                (item) => (
                                                                    <SelectItem
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        value={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    How many years of experience
                                                    is required?
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="jobType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Job Type
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select your job type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {jobTypeEnum.map(
                                                            (
                                                                jobtype,
                                                                index
                                                            ) => (
                                                                <SelectItem
                                                                    key={index}
                                                                    value={
                                                                        jobtype
                                                                    }
                                                                >
                                                                    {jobtype}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    What type of Job is it?
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="workArrangement"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Work Arrangement
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select your work arrangement" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {workArrangementEnum.map(
                                                            (
                                                                arrangement,
                                                                index
                                                            ) => (
                                                                <SelectItem
                                                                    key={index}
                                                                    value={
                                                                        arrangement
                                                                    }
                                                                >
                                                                    {
                                                                        arrangement
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Is it Remote, Hybrid or
                                                    On-site?
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="sm:col-span-6">
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <h2 className="text-base font-semibold leading-7 text-gray-900">
                                                Contact Details
                                            </h2>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                Who will be contacted for the
                                                job updates?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="primaryEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Primary Email
                                                </FormLabel>
                                                <FormDescription>
                                                    Applications will be sent to
                                                    this primary address
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        placeholder="primary@email.com"
                                                        {...field}
                                                        disabled={useEmail}
                                                        value={
                                                            useEmail ?? false
                                                                ? user?.email ||
                                                                  ""
                                                                : field.value
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            className=""
                                                            checked={useEmail}
                                                            onCheckedChange={(
                                                                e
                                                            ) =>
                                                                setUseEmail(
                                                                    !useEmail
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="terms"
                                                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Use my email address
                                                        </label>
                                                    </div>
                                                </FormDescription>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="secondaryEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Secondary Email
                                                </FormLabel>
                                                <FormDescription>
                                                    Applications will be sent to
                                                    this secondary address
                                                </FormDescription>
                                                <FormControl>
                                                    <Input
                                                        placeholder="secondary@email.com"
                                                        {...field}
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="redirectUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Job Page</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="https://www.company.com/"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Applications will redirected
                                                    to this page.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <h2 className="text-base font-semibold leading-7 text-gray-900">
                                                Location
                                            </h2>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                Where is the company located?
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="jProvince"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    Province
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue(
                                                            "jProvince",
                                                            provinceData.find(
                                                                (
                                                                    item: Province
                                                                ) =>
                                                                    item.province_code ===
                                                                    value
                                                            )?.province_name ??
                                                                ""
                                                        );
                                                        jcity(value);
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a Province" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {provinceData &&
                                                            provinceData.length >
                                                                0 &&
                                                            provinceData.map(
                                                                (
                                                                    item: Province
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            item.province_code
                                                                        }
                                                                        value={
                                                                            item.province_code
                                                                        }
                                                                    >
                                                                        {
                                                                            item.province_name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Select your province.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="jCity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required={true}>
                                                    City
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue(
                                                            "jCity",
                                                            jcityData.find(
                                                                (item: City) =>
                                                                    item.city_code ===
                                                                    value
                                                            )?.city_name ?? ""
                                                        );
                                                        jbarangay(value);
                                                    }}
                                                    defaultValue={field.value}
                                                    disabled={
                                                        !form.getValues(
                                                            "jProvince"
                                                        )
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a city" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {jcityData &&
                                                            jcityData.length >
                                                                0 &&
                                                            jcityData.map(
                                                                (
                                                                    item: City
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            item.city_code
                                                                        }
                                                                        value={
                                                                            item.city_code
                                                                        }
                                                                    >
                                                                        {
                                                                            item.city_name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Select your city.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name="jBarangay"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel optional={true}>
                                                    Barangay
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue(
                                                            "jBarangay",
                                                            jbarangayData.find(
                                                                (
                                                                    item: Barangay
                                                                ) =>
                                                                    item.brgy_code ===
                                                                    value
                                                            )?.brgy_name ?? ""
                                                        );
                                                    }}
                                                    defaultValue={field.value}
                                                    disabled={
                                                        !form.getValues("jCity")
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a Barangay" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {jbarangayData &&
                                                            jbarangayData.length >
                                                                0 &&
                                                            jbarangayData.map(
                                                                (
                                                                    item: Barangay
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            item.brgy_code
                                                                        }
                                                                        value={
                                                                            item.brgy_code
                                                                        }
                                                                    >
                                                                        {
                                                                            item.brgy_name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Select your barangay.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            className="text-centerl container flex w-full flex-col items-center justify-center gap-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 0.5,
                                    ease: "easeInOut",
                                    staggerChildren: 0.2,
                                },
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: 1,
                                    opacity: 1,
                                    transition: {
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    },
                                }}
                                className="my-4"
                            >
                                <CheckCircle2 className="h-20 w-20 fill-green-500 text-white" />
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.5,
                                        ease: "easeInOut",
                                    },
                                }}
                                className="text-5xl font-black leading-7 text-gray-900"
                            >
                                Posting Complete
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.5,
                                        ease: "easeInOut",
                                    },
                                }}
                                className="mt-1 text-sm leading-6 text-gray-600"
                            >
                                Thank you for your submission.
                            </motion.p>
                            <Link href="/dashboard">
                                <Button variant="outline">Return</Button>
                            </Link>
                        </motion.div>
                    )}
                </form>
            </Form>
            {/* Navigation */}
            <div
                className={`mt-8 pt-5 ${currentStep === steps.length - 1 ? "hidden" : ""}`}
            >
                <div className="flex justify-between">
                    <Button
                        onClick={() => {
                            window.scrollTo(0, 0);
                            prev();
                        }}
                        disabled={currentStep === 0}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                        </svg>
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            window.scrollTo(0, 0);
                            next();
                        }}
                        disabled={currentStep === steps.length - 1}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    </Button>
                </div>
            </div>
        </section>
    );
}
