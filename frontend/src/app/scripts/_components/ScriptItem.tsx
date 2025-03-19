
import { Separator } from "@/components/ui/separator";
import { extractDate } from "@/lib/time";
import { Script, AppVersion } from "@/lib/types";
import { fetchVersions } from "@/lib/data";

import { X } from "lucide-react";
import Image from "next/image";

import { getDisplayValueFromType } from "./ScriptInfoBlocks";
import Alerts from "./ScriptItems/Alerts";
import Buttons from "./ScriptItems/Buttons";
import DefaultPassword from "./ScriptItems/DefaultPassword";
import DefaultSettings from "./ScriptItems/DefaultSettings";
import Description from "./ScriptItems/Description";
import InstallCommand from "./ScriptItems/InstallCommand";
import InterFaces from "./ScriptItems/InterFaces";
import Tooltips from "./ScriptItems/Tooltips";
import { basePath } from "@/config/siteConfig";
import { useEffect, useState } from "react";


function ScriptItem({
  item,
  setSelectedScript,
}: {
  item: Script;
  setSelectedScript: (script: string | null) => void;
}) {
  const closeScript = () => {
    window.history.pushState({}, document.title, window.location.pathname);
    setSelectedScript(null);
  };
  const [versions, setVersions] = useState<AppVersion[]>([]);


  useEffect(() => {
    fetchVersions()
      .then((fetchedVersions) => {
        console.log("Fetched Versions: ", fetchedVersions);
        if (Array.isArray(fetchedVersions)) {
          setVersions(fetchedVersions);
        } else if (fetchedVersions && typeof fetchedVersions === "object") {
          setVersions([fetchedVersions]);
        } else {
          setVersions([]);
        }
      })
      .catch((error) => console.error("Error fetching versions:", error));
  }, []);

  const defaultInstallMethod = item.install_methods?.[0];
  const os = defaultInstallMethod?.resources?.os || "Proxmox Node";
  const version = defaultInstallMethod?.resources?.version || "";

  return (
    <div className="mr-7 mt-0 flex w-full min-w-fit">
      <div className="flex w-full min-w-fit">
        <div className="flex w-full flex-col">
          <div className="flex h-[36px] min-w-max items-center justify-between">
            <h2 className="text-lg font-semibold">Selected Script</h2>
            <X onClick={closeScript} className="cursor-pointer" />
          </div>
          <div className="rounded-lg border bg-accent/20 p-4">
            <div className="flex justify-between">
              <div className="flex">
                <Image
                  className="h-32 w-32 rounded-lg bg-accent/60 object-contain p-3 shadow-md"
                  src={item.logo || `/${basePath}/logo.png`}
                  width={400}
                  onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).src =
                    `/${basePath}/logo.png`)
                  }
                  height={400}
                  alt={item.name}
                  unoptimized
                />
                <div className="ml-4 flex flex-col justify-between">
                  <div className="flex h-full w-full flex-col justify-between">
                    <div>
                      <h1 className="text-lg font-semibold">
                        {item.name} {getDisplayValueFromType(item.type)}
                      </h1>
                      <p className="w-full text-sm text-muted-foreground">
                        Date added: {extractDate(item.date_created)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Default OS: {os} {version}
                      </p>
                    </div>
                    <div className="flex gap-5">
                      <DefaultSettings item={item} />
                    </div>
                    <div>{versions.length === 0 ? (<p>Loading versions...</p>) :
                      (<>
                        <p className="text-l text-foreground">Version:</p>
                        <p className="text-l text-muted-foreground">{versions.find((v) =>
                          v.name === item.slug.replace(/[^a-z0-9]/g, '') ||
                          v.name.includes(item.slug.replace(/[^a-z0-9]/g, '')) ||
                          v.name.replace(/[^a-z0-9]/g, '') === item.slug.replace(/[^a-z0-9]/g, '')

                        )?.version || "No Version information found"
                        }</p>
                        <p className="text-l text-foreground">Latest changes:</p>
                        <p className="text-l text-muted-foreground">
                          {(() => {
                            const matchedVersion = versions.find((v) =>
                              v.name === item.slug.replace(/[^a-z0-9]/g, '') ||
                              v.name.includes(item.slug.replace(/[^a-z0-9]/g, '')) ||
                              v.name.replace(/[^a-z0-9]/g, '') === item.slug.replace(/[^a-z0-9]/g, '')
                            );
                            return matchedVersion?.date ?
                              extractDate(matchedVersion.date as unknown as string) :
                              "No date information found"
                          })()}
                        </p>
                      </>)
                    }
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden flex-col justify-between gap-2 sm:flex">
                <InterFaces item={item} />
                <Buttons item={item} />
              </div>
            </div>
            <Separator className="mt-4" />
            <div>
              <div className="mt-4">
                <Description item={item} />
                <Alerts item={item} />
              </div>
              <div className="mt-4 rounded-lg border bg-accent/50">
                <div className="flex gap-3 px-4 py-2">
                  <h2 className="text-lg font-semibold">
                    How to {item.type == "misc" ? "use" : "install"}
                  </h2>
                  <Tooltips item={item} />
                </div>
                <Separator className="w-full"></Separator>
                <InstallCommand item={item} />
              </div>
            </div>
            <DefaultPassword item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScriptItem;
