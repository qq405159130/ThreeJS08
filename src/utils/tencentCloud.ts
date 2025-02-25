// src/utils/tencentCloud.ts
import { Credential, TiiaClient, Models } from 'tencentcloud-sdk-nodejs';

export const detectFloorPlan = async (imageFile: File) => {
    const cred = new Credential({
        secretId: 'Your-TmpSecretId',
        secretKey: 'Your-TmpSecretKey',
        token: 'Your-Token',
    });

    const client = new TiiaClient(cred, 'ap-guangzhou');

    const req = new Models.DetectLabelRequest();
    req.ImageBase64 = await fileToBase64(imageFile);

    const response = await client.DetectLabel(req);
    return response;
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};