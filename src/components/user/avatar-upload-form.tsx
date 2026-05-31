import { Camera, Upload } from "lucide-react";
import { PendingSubmitButton } from "@/components/shared/loading-ui";
import { UserAvatar } from "@/components/shared/user-avatar";

type AvatarUploadFormProps = {
  displayName: string;
  avatarUrl?: string | null;
};

export function AvatarUploadForm({ displayName, avatarUrl }: AvatarUploadFormProps) {
  return (
    <form action="/api/profile/avatar" className="mt-5 rounded-[1.5rem] border border-[#bdcabe]/60 bg-[#f3fcf3] p-4 text-left" encType="multipart/form-data" method="post">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <UserAvatar className="ring-white" name={displayName} size="lg" src={avatarUrl} />
          <span className="absolute bottom-0 right-0 grid size-9 place-items-center rounded-full bg-[#007a3d] text-white ring-4 ring-white">
            <Camera size={16} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-[#151d18]">Ảnh đại diện</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#6e7a70]">JPG, PNG hoặc WebP. Tối đa 2 MB.</p>
        </div>
      </div>

      <label className="mt-4 grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#3e4941]">
        Chọn ảnh mới
        <input accept="image/jpeg,image/png,image/webp" className="w-full rounded-2xl border border-[#bdcabe] bg-white p-3 text-sm font-semibold normal-case tracking-normal text-[#151d18] file:mr-3 file:rounded-full file:border-0 file:bg-[#d8f5df] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#007a3d]" name="avatar" required type="file" />
      </label>

      <PendingSubmitButton className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#007a3d] px-5 text-sm font-black text-white transition hover:bg-[#006a3d] disabled:cursor-wait disabled:opacity-80" pendingLabel="Đang tải ảnh..." type="submit">
        <Upload size={17} />
        Tải ảnh lên
      </PendingSubmitButton>
    </form>
  );
}
