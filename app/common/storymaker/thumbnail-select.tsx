"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type ThumbnailOption = {
  id: string
  name: string
  imageUrl?: string
}

interface ThumbnailSelectProps {
  options: ThumbnailOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function ThumbnailSelect({ options, value, onValueChange, placeholder = "Select..." }: ThumbnailSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find((option) => option.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start h-auto p-2 bg-transparent"
        >
          {selectedOption ? (
            <div className="flex items-center gap-2 w-full">
              {selectedOption.imageUrl && (
                <img
                  src={selectedOption.imageUrl || "/placeholder.svg"}
                  alt={selectedOption.name}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <span className="truncate text-sm">{selectedOption.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    onValueChange(option.id)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl || "/placeholder.svg"}
                      alt={option.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <span className="flex-1 truncate">{option.name}</span>
                  <Check className={cn("h-4 w-4 flex-shrink-0", value === option.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}