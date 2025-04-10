import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { projectMetadataSchema, type ProjectMetadata, type Service } from "@shared/schema";
import { springBootVersions, buildSystems, languages, javaVersions } from "@/lib/springBootOptions";

interface ConfigurationFormProps {
  serviceData: Service;
}

export default function ConfigurationForm({ serviceData }: ConfigurationFormProps) {
  const { toast } = useToast();

  // Initialize form with service data
  const form = useForm<ProjectMetadata>({
    resolver: zodResolver(projectMetadataSchema),
    defaultValues: {
      name: serviceData.name,
      buildSystem: serviceData.buildSystem as "maven" | "gradle-groovy" | "gradle-kotlin",
      language: serviceData.language as "java" | "kotlin" | "groovy",
      springBootVersion: serviceData.springBootVersion,
      group: serviceData.group,
      artifact: serviceData.artifact,
      description: serviceData.description,
      packageName: serviceData.packageName,
      packaging: serviceData.packaging as "jar" | "war",
      javaVersion: serviceData.javaVersion as "17" | "21" | "24",
      dependencies: serviceData.dependencies,
    },
  });

  const onSubmit = async (data: ProjectMetadata) => {
    try {
      await apiRequest("PUT", `/api/services/${serviceData.id}`, data);
      
      // Invalidate the services cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: "Service updated",
        description: "Service configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the service configuration. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Build System Selection */}
          <div className="space-y-4 col-span-1">
            <h3 className="text-md font-semibold">Project</h3>
            <FormField
              control={form.control}
              name="buildSystem"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      {buildSystems.map((buildSystem) => (
                        <FormItem key={buildSystem.value} className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value={buildSystem.value} />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {buildSystem.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-4 col-span-1">
            <h3 className="text-md font-semibold">Language</h3>
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      {languages.map((language) => (
                        <FormItem key={language.value} className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value={language.value} />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {language.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Spring Boot Version Selection */}
          <div className="space-y-4 col-span-1">
            <h3 className="text-md font-semibold">Spring Boot</h3>
            <FormField
              control={form.control}
              name="springBootVersion"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      {springBootVersions.map((version) => (
                        <FormItem key={version.value} className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value={version.value} />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {version.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Project Metadata Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-md font-semibold">Project Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="artifact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artifact</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="packageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center space-x-6">
              <FormField
                control={form.control}
                name="packaging"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Packaging</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="jar" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Jar
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="war" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            War
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="javaVersion"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Java</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        {javaVersions.map((version) => (
                          <FormItem key={version.value} className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value={version.value} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {version.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <div>
            <Button
              type="button"
              variant="outline"
              className="mr-2"
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Continue to Dependencies
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
